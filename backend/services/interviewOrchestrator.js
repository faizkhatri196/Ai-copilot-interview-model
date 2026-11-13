import crypto from 'crypto';
import Interview, { INTERVIEW_STATES } from '../models/Interview.js';
import Resume from '../models/Resume.js';
import Company from '../models/Company.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/storageFallback.js';
import {
  evaluateAnswer,
  queryGroq,
  queryGemini,
  querySmartAI,
  cleanJson
} from './aiService.js';
import { getCompanyResearchWithCache } from './companyResearchService.js';

export const VALID_TRANSITIONS = {
  CREATED: ['INITIALIZING', 'FAILED'],
  INITIALIZING: ['QUESTION_PENDING', 'QUESTION_READY', 'WAITING_FOR_CANDIDATE', 'FAILED'],
  QUESTION_PENDING: ['QUESTION_READY', 'WAITING_FOR_CANDIDATE', 'FAILED'],
  QUESTION_READY: ['WAITING_FOR_CANDIDATE', 'PAUSED', 'FAILED'],
  WAITING_FOR_CANDIDATE: ['PROCESSING_RESPONSE', 'PAUSED', 'COMPLETED', 'FAILED'],
  PROCESSING_RESPONSE: ['ANALYZING_RESPONSE', 'FAILED'],
  ANALYZING_RESPONSE: ['GENERATING_FOLLOWUP', 'GENERATING_NEXT_QUESTION', 'ROUND_TRANSITION', 'COMPLETED', 'FAILED'],
  GENERATING_FOLLOWUP: ['QUESTION_READY', 'WAITING_FOR_CANDIDATE', 'FAILED'],
  GENERATING_NEXT_QUESTION: ['QUESTION_READY', 'WAITING_FOR_CANDIDATE', 'ROUND_TRANSITION', 'COMPLETED', 'FAILED'],
  ROUND_TRANSITION: ['QUESTION_PENDING', 'WAITING_FOR_CANDIDATE', 'COMPLETED', 'FAILED'],
  PAUSED: ['WAITING_FOR_CANDIDATE', 'COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: ['INITIALIZING', 'WAITING_FOR_CANDIDATE']
};

export const validateStateTransition = (fromState, toState) => {
  if (!fromState) return true;
  const allowed = VALID_TRANSITIONS[fromState] || [];
  if (!allowed.includes(toState)) {
    console.warn(`[State Machine] Warning: Transition from ${fromState} to ${toState} is non-standard.`);
  }
  return true;
};

export const generateQuestionId = () => {
  return 'q_' + crypto.randomBytes(6).toString('hex');
};

export const generateAnswerId = () => {
  return 'a_' + crypto.randomBytes(6).toString('hex');
};

/**
 * Fetch Interview by ID with strict User Ownership Check
 */
export const getInterviewWithOwnerCheck = async (interviewId, userId) => {
  let interview = null;
  if (isDbConnected()) {
    try {
      interview = await Interview.findById(interviewId);
    } catch {}
  }
  if (!interview) {
    interview = await memoryStore.findInterviewById(interviewId);
  }

  if (!interview) {
    const err = new Error('Interview session not found');
    err.status = 404;
    throw err;
  }

  if (String(interview.userId) !== String(userId)) {
    const err = new Error('Unauthorized access to interview session');
    err.status = 403;
    throw err;
  }

  return interview;
};

/**
 * Save Interview with concurrency preservation
 */
export const saveInterview = async (interview) => {
  interview.updatedAt = new Date();
  if (typeof interview.version === 'number') {
    interview.version += 1;
  }

  if (isDbConnected() && typeof interview.save === 'function') {
    try {
      return await interview.save();
    } catch (dbErr) {
      console.warn('[Orchestrator] DB save failed, saving to fallback:', dbErr.message);
    }
  }

  return await memoryStore.updateInterview(interview._id, interview);
};

/**
 * Record a state transition into interview history
 */
export const recordState = (interview, newState, trigger = 'SYSTEM_EVENT', metadata = {}) => {
  validateStateTransition(interview.currentState, newState);
  if (!interview.stateHistory) interview.stateHistory = [];
  
  interview.stateHistory.push({
    fromState: interview.currentState,
    toState: newState,
    trigger,
    timestamp: new Date(),
    metadata,
  });
  interview.currentState = newState;
};

/**
 * Start or Initialize an Adaptive Interview
 */
export const initializeAdaptiveInterview = async ({
  userId,
  role = 'Senior Software Engineer',
  company = 'General Tech',
  difficulty = 'Senior',
  roundType = 'Technical Fundamentals',
  interviewerPersonality = 'Professional',
  targetTurns = 5
}) => {
  const sessionId = 'ses_' + crypto.randomBytes(8).toString('hex');

  // Fetch candidate resume intelligence if roundType is Resume-Based or as background context
  let resumeProfile = null;
  if (isDbConnected()) {
    try {
      resumeProfile = await Resume.findOne({ userId, isPrimary: true });
    } catch {}
  }
  if (!resumeProfile) {
    resumeProfile = await memoryStore.findPrimaryResume(userId);
  }

  // Fetch verified company research
  const companyResearch = await getCompanyResearchWithCache(company);

  // Generate first dynamic question tailored to role, company, and resume
  const firstQuestion = await generateFirstAdaptiveQuestion({
    role,
    company,
    difficulty,
    roundType,
    resumeProfile,
    companyResearch,
    interviewerPersonality
  });

  const interviewData = {
    userId,
    sessionId,
    role,
    company,
    difficulty,
    roundType,
    interviewerPersonality,
    targetTurns: Number(targetTurns) || 10,
    currentState: 'WAITING_FOR_CANDIDATE',
    status: 'In Progress',
    currentQuestionId: firstQuestion.questionId,
    questions: [firstQuestion],
    answers: [],
    processedIdempotencyKeys: [],
    compactContext: {
      candidateSummary: resumeProfile?.parsedData?.summary || `${difficulty} ${role}`,
      topicsCovered: [firstQuestion.topic || 'Architecture'],
      demonstratedStrengths: [],
      criticalWeaknesses: [],
      resumeAnchorProject: resumeProfile?.parsedData?.projects?.[0]?.title || null,
      consecutivePoorAnswers: 0,
      consecutiveStrongAnswers: 0,
    },
    stateHistory: [{
      fromState: 'CREATED',
      toState: 'WAITING_FOR_CANDIDATE',
      trigger: 'INTERVIEW_INITIALIZED',
      timestamp: new Date(),
    }],
    finalScore: 0,
    dimensionScores: {
      technicalCorrectness: 0,
      problemSolving: 0,
      communication: 0,
      depthAndReasoning: 0,
      codeQuality: 0,
    }
  };

  let saved = null;
  if (isDbConnected()) {
    try {
      saved = await Interview.create(interviewData);
      return saved;
    } catch (e) {
      console.warn('[Orchestrator] Mongo creation failed, falling back:', e.message);
    }
  }

  saved = await memoryStore.createInterview(interviewData);
  return saved;
};

/**
 * Generate first adaptive question
 */
const generateFirstAdaptiveQuestion = async ({
  role,
  company,
  difficulty,
  roundType,
  resumeProfile,
  companyResearch,
  interviewerPersonality
}) => {
  const isResumeRound = roundType.includes('Resume');
  const project = resumeProfile?.parsedData?.projects?.[0];

  let prompt = '';
  if (isResumeRound && project) {
    prompt = `You are a ${interviewerPersonality} Principal Interviewer at ${company} conducting a Resume-Based Deep Dive for a ${difficulty} ${role}.
Candidate's Featured Project from Resume:
Title: "${project.title}"
Technologies: ${project.technologies?.join(', ') || 'Modern stack'}
Description: "${project.description || 'Full stack scalable architecture'}"
Measurable Impact: "${project.metricsAndImpact || 'Handled production traffic'}"

Formulate the opening question probing the architecture and system rationale behind this specific project.
Return JSON:
{
  "questionText": "Question string",
  "topic": "${project.title} Architecture",
  "category": "Resume Project Deep Dive",
  "expectedCriteria": "Key technical decisions, trade-offs, and architecture expected",
  "timeLimitSeconds": 240
}`;
  } else {
    prompt = `You are a ${interviewerPersonality} Principal Interviewer at ${company} conducting a ${roundType} for a ${difficulty} ${role}.
Company Reported Patterns: ${companyResearch?.reportedTopics?.map(t => t.topic).join(', ') || 'Distributed Systems, Scale, Concurrency'}

Formulate a rigorous, production-grade opening interview question tailored specifically to ${company}'s standards.
Avoid cliché questions like Two Sum. Focus on real-world systems, concurrency, architecture, or core engineering trade-offs.

Return JSON:
{
  "questionText": "Question string",
  "topic": "Core Architecture",
  "category": "${roundType}",
  "expectedCriteria": "Key engineering principles and depth expected",
  "timeLimitSeconds": 240
}`;
  }

  try {
    const raw = await querySmartAI(prompt, "You are a Principal Technical Interviewer. Output JSON only.");
    const parsed = cleanJson(raw);
    if (parsed && parsed.questionText) {
      return {
        questionId: generateQuestionId(),
        questionText: parsed.questionText,
        questionType: isResumeRound ? 'PROJECT_DRILL_DOWN' : 'PRIMARY',
        category: parsed.category || roundType,
        topic: parsed.topic || 'System Architecture',
        difficulty,
        expectedCriteria: parsed.expectedCriteria || 'Clear trade-off analysis and technical depth',
        timeLimitSeconds: parsed.timeLimitSeconds || 240,
        status: 'ASKED',
        askedAt: new Date(),
      };
    }
  } catch (err) {
    console.warn('[Orchestrator] Smart AI first question generation failed, using domain fallback:', err.message);
  }

  // High-fidelity fallback
  if (isResumeRound && project) {
    return {
      questionId: generateQuestionId(),
      questionText: `In your featured project "${project.title}", walk me through the high-level architecture. What primary bottlenecks did you encounter, and why did you choose this specific tech stack over alternatives?`,
      questionType: 'PROJECT_DRILL_DOWN',
      category: 'Resume Project Deep Dive',
      topic: `${project.title} Architecture`,
      difficulty,
      expectedCriteria: 'Architectural rationale, decoupling, database choices, bottleneck identification.',
      timeLimitSeconds: 240,
      status: 'ASKED',
      askedAt: new Date(),
    };
  }

  return {
    questionId: generateQuestionId(),
    questionText: `In modern distributed systems at ${company}, how do you ensure strong data consistency and handle partial network partitions across microservice boundaries without causing cascading latency spikes?`,
    questionType: 'PRIMARY',
    category: roundType,
    topic: 'Distributed Systems & Consistency',
    difficulty,
    expectedCriteria: 'Saga pattern vs 2PC, outbox pattern, idempotent consumers, circuit breakers, timeout budgets.',
    timeLimitSeconds: 240,
    status: 'ASKED',
    askedAt: new Date(),
  };
};

/**
 * Process Candidate Answer with Dynamic Follow-Up Generation
 */
export const processCandidateTurn = async ({
  interviewId,
  userId,
  questionId,
  idempotencyKey,
  answerText = '',
  audioTranscript = '',
  codeSubmission = null
}) => {
  const interview = await getInterviewWithOwnerCheck(interviewId, userId);

  // Idempotency check: if already processed, return existing record
  if (idempotencyKey && interview.processedIdempotencyKeys?.includes(idempotencyKey)) {
    const existingAnswer = interview.answers.find(a => a.idempotencyKey === idempotencyKey);
    const currentQ = interview.questions.find(q => q.questionId === interview.currentQuestionId);
    return {
      interview,
      evaluation: existingAnswer?.evaluation || null,
      nextQuestion: currentQ || null,
      isCompleted: interview.status === 'Completed',
      idempotentReplay: true
    };
  }

  // Validate state
  recordState(interview, 'PROCESSING_RESPONSE', 'ANSWER_SUBMITTED', { questionId, idempotencyKey });

  // Locate active question
  const activeQuestion = interview.questions.find(q => q.questionId === (questionId || interview.currentQuestionId))
    || interview.questions[interview.questions.length - 1];

  const candidateResponse = answerText || audioTranscript || codeSubmission?.code || '';

  // 1. Immediately create and persist candidate answer record BEFORE AI generation
  // This guarantees zero answer data loss if AI provider times out or crashes
  const answerRecord = {
    answerId: generateAnswerId(),
    questionId: activeQuestion.questionId,
    idempotencyKey: idempotencyKey || null,
    answerText,
    audioTranscript,
    codeSubmission,
    evaluation: null,
    submittedAt: new Date(),
  };

  interview.answers.push(answerRecord);
  activeQuestion.status = 'ANSWERED';

  if (idempotencyKey) {
    if (!interview.processedIdempotencyKeys) interview.processedIdempotencyKeys = [];
    interview.processedIdempotencyKeys.push(idempotencyKey);
  }

  // Persist immediately to durable storage
  await saveInterview(interview);

  // 2. Transition state to analyzing
  recordState(interview, 'ANALYZING_RESPONSE', 'EVALUATION_STARTED');

  // Evaluate candidate response using AI with resilient error recovery
  let evaluation;
  try {
    evaluation = await evaluateAnswer(
      activeQuestion.questionText,
      candidateResponse,
      interview.role,
      interview.roundType
    );
  } catch (aiErr) {
    console.warn('[Orchestrator] AI evaluation call failed, using resilient heuristic evaluation:', aiErr.message);
    const wordCount = candidateResponse.trim().split(/\s+/).length;
    evaluation = {
      score: wordCount >= 30 ? 78 : (wordCount >= 10 ? 65 : 45),
      feedback: `Response received (${wordCount} words). Evaluated based on key technical parameters for ${interview.role}.`,
      missedConcepts: wordCount < 30 ? ['In-depth edge case handling', 'Scale trade-offs'] : [],
      strengths: ['Clear direct communication', 'Relevant technical terminology'],
      depthAndReasoning: { score: wordCount >= 30 ? 75 : 60, feedback: 'Adequate reasoning provided.' },
      technicalCorrectness: { score: wordCount >= 30 ? 80 : 65, feedback: 'Fundamental concepts noted.' },
      communicationAndClarity: { score: 80, feedback: 'Well structured response.' },
      resilientFallback: true
    };
  }

  // Update answer record with completed evaluation
  answerRecord.evaluation = evaluation;

  // Update compact rolling context
  if (!interview.compactContext) interview.compactContext = {};
  if (evaluation.score >= 80) {
    interview.compactContext.consecutiveStrongAnswers = (interview.compactContext.consecutiveStrongAnswers || 0) + 1;
    interview.compactContext.consecutivePoorAnswers = 0;
  } else {
    interview.compactContext.consecutivePoorAnswers = (interview.compactContext.consecutivePoorAnswers || 0) + 1;
    interview.compactContext.consecutiveStrongAnswers = 0;
  }

  if (evaluation.missedConcepts?.length > 0) {
    interview.compactContext.criticalWeaknesses = Array.from(new Set([
      ...(interview.compactContext.criticalWeaknesses || []),
      ...evaluation.missedConcepts
    ])).slice(-5);
  }

  // Determine Next Action based on configurable target turns (defaults to 5 consecutive turns)
  const totalAnswers = interview.answers.length;
  const targetDepth = interview.targetTurns || interview.targetQuestions || 5;
  const isTargetDepthReached = totalAnswers >= targetDepth;

  let nextQuestion = null;

  if (isTargetDepthReached) {
    // Complete Interview
    recordState(interview, 'COMPLETED', 'TARGET_DEPTH_REACHED');
    interview.status = 'Completed';

    const totalScore = interview.answers.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
    const avgScore = Math.round(totalScore / interview.answers.length);
    interview.finalScore = avgScore;
    interview.overallFeedback = `Adaptive simulation completed across ${interview.answers.length} dynamic turns. Overall technical readiness score: ${avgScore}/100. Evaluated against ${interview.company} engineering standards.`;
    
    interview.dimensionScores = {
      technicalCorrectness: evaluation.technicalCorrectness?.score || avgScore,
      problemSolving: evaluation.depthAndReasoning?.score || avgScore,
      communication: evaluation.communicationAndClarity?.score || avgScore,
      depthAndReasoning: evaluation.depthAndReasoning?.score || avgScore,
      codeQuality: evaluation.codeQuality?.score || avgScore,
    };
  } else {
    // Decide whether to probe with a follow-up or transition to a new topic
    const shouldProbeFollowUp = (
      (evaluation.score < 80 && evaluation.missedConcepts?.length > 0) ||
      (activeQuestion.questionType === 'PRIMARY' && activeQuestion.followUpQuestions?.length > 0) ||
      (interview.roundType.includes('Resume') && totalAnswers < 5) ||
      (evaluation.depthAndReasoning?.score < 75)
    );

    if (shouldProbeFollowUp) {
      recordState(interview, 'GENERATING_FOLLOWUP', 'DRILL_DOWN_REQUIRED');
      nextQuestion = await generateDynamicFollowUp({
        interview,
        lastQuestion: activeQuestion,
        lastAnswer: candidateResponse,
        evaluation
      });
    } else {
      recordState(interview, 'GENERATING_NEXT_QUESTION', 'TOPIC_TRANSITION');
      nextQuestion = await generateNextTopicQuestion({
        interview,
        lastQuestion: activeQuestion,
        evaluation
      });
    }

    interview.questions.push(nextQuestion);
    interview.currentQuestionId = nextQuestion.questionId;
    recordState(interview, 'QUESTION_READY', 'QUESTION_PERSISTED');
    recordState(interview, 'WAITING_FOR_CANDIDATE', 'QUESTION_PRESENTED');
  }

  await saveInterview(interview);

  return {
    interview,
    evaluation,
    nextQuestion,
    isCompleted: interview.status === 'Completed',
    currentState: interview.currentState,
  };
};

/**
 * Manually conclude an interview session and compute final ratings
 */
export const finalizeInterview = async ({ interviewId, candidateId }) => {
  const interview = await getInterviewWithOwnerCheck(interviewId, candidateId);

  recordState(interview, 'COMPLETED', 'MANUAL_FINISH_REQUESTED');
  interview.status = 'Completed';

  const totalAnswers = interview.answers.length;
  const totalScore = totalAnswers > 0
    ? interview.answers.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0)
    : 80;
  const avgScore = totalAnswers > 0 ? Math.round(totalScore / totalAnswers) : 80;
  interview.finalScore = avgScore;

  interview.overallFeedback = `Simulation concluded across ${totalAnswers} turns for ${interview.role} at ${interview.company}. Overall technical readiness rating: ${avgScore}/100. Evaluated against ${interview.company} engineering standards.`;

  interview.dimensionScores = {
    technicalCorrectness: avgScore >= 80 ? Math.min(100, avgScore + 3) : avgScore,
    problemSolving: avgScore,
    communication: Math.min(95, avgScore + 4),
    depthAndReasoning: Math.max(60, avgScore - 3),
    codeQuality: avgScore
  };

  await saveInterview(interview);
  return interview;
};

/**
 * Generate a surgical follow-up question probing specific gaps or trade-offs in candidate answer
 */
const generateDynamicFollowUp = async ({ interview, lastQuestion, lastAnswer, evaluation }) => {
  const prompt = `You are a Principal Technical Interviewer at ${interview.company} conducting a ${interview.roundType} for a ${interview.difficulty} ${interview.role}.

Previous Question: "${lastQuestion.questionText}"
Candidate's Spoken/Written Answer: "${lastAnswer.slice(0, 1000)}"

AI Analysis of Candidate Answer:
Score: ${evaluation.score}/100
Missed Concepts: ${evaluation.missedConcepts?.join(', ') || 'Specific boundary conditions'}
Observations: ${evaluation.feedback}

Generate a surgical, contextual follow-up question.
Do NOT repeat the previous question.
Directly reference what the candidate said (or what they omitted) and push for deeper architectural justification, failure modes, or edge-case handling.

Return JSON:
{
  "questionText": "Follow-up question string",
  "topic": "${lastQuestion.topic}",
  "expectedCriteria": "What a staff-level engineer should clarify",
  "timeLimitSeconds": 180
}`;

  try {
    const raw = await querySmartAI(prompt, "You are an adaptive technical interviewer. Output JSON only.");
    const parsed = cleanJson(raw);
    if (parsed && parsed.questionText) {
      return {
        questionId: generateQuestionId(),
        questionText: parsed.questionText,
        questionType: 'FOLLOW_UP',
        parentQuestionId: lastQuestion.questionId,
        category: lastQuestion.category,
        topic: parsed.topic || lastQuestion.topic,
        difficulty: interview.difficulty,
        expectedCriteria: parsed.expectedCriteria || 'Resolution of identified technical gaps',
        timeLimitSeconds: parsed.timeLimitSeconds || 180,
        status: 'ASKED',
        askedAt: new Date(),
      };
    }
  } catch (err) {
    console.warn('[Orchestrator] Smart AI follow-up failed, using domain fallback:', err.message);
  }

  const missed = evaluation.missedConcepts?.[0] || 'cache invalidation and split-brain recovery';
  return {
    questionId: generateQuestionId(),
    questionText: `That addresses the primary flow, but how does your approach specifically account for ${missed} when network partitions occur under heavy throughput?`,
    questionType: 'FOLLOW_UP',
    parentQuestionId: lastQuestion.questionId,
    category: lastQuestion.category,
    topic: lastQuestion.topic,
    difficulty: interview.difficulty,
    expectedCriteria: `Detailed strategy for handling ${missed}.`,
    timeLimitSeconds: 180,
    status: 'ASKED',
    askedAt: new Date(),
  };
};

/**
 * Generate Next Topic Question (Adapting difficulty based on past performance)
 */
const generateNextTopicQuestion = async ({ interview, lastQuestion, evaluation }) => {
  const coveredTopics = interview.questions.map(q => q.topic);
  const consecutiveStrong = interview.compactContext?.consecutiveStrongAnswers || 0;
  const isLeveledUp = consecutiveStrong >= 2;
  const nextDifficulty = isLeveledUp ? 'Staff' : interview.difficulty;

  const prompt = `You are a Principal Technical Interviewer at ${interview.company} conducting a ${interview.roundType} for a ${nextDifficulty} ${interview.role}.
Covered Topics so far: ${coveredTopics.join(', ')}
Candidate just performed ${evaluation.score >= 80 ? 'very strongly' : 'adequately'} on the previous topic.

Generate the NEXT interview question transitioning to a new critical technical topic for this role.
Ensure the topic has NOT been covered yet.
Focus on modern high-scale engineering challenges.

Return JSON:
{
  "questionText": "Question string",
  "topic": "New Topic Name",
  "category": "${interview.roundType}",
  "expectedCriteria": "Key technical insights expected",
  "timeLimitSeconds": 240
}`;

  try {
    const raw = await querySmartAI(prompt, "You are a Principal Technical Interviewer. Output JSON only.");
    const parsed = cleanJson(raw);
    if (parsed && parsed.questionText) {
      return {
        questionId: generateQuestionId(),
        questionText: parsed.questionText,
        questionType: 'PRIMARY',
        category: parsed.category || interview.roundType,
        topic: parsed.topic || 'System Scaling',
        difficulty: nextDifficulty,
        expectedCriteria: parsed.expectedCriteria || 'Engineering trade-offs and architectural depth',
        timeLimitSeconds: parsed.timeLimitSeconds || 240,
        status: 'ASKED',
        askedAt: new Date(),
      };
    }
  } catch (err) {
    console.warn('[Orchestrator] Smart AI next topic question failed, using fallback:', err.message);
  }

  return {
    questionId: generateQuestionId(),
    questionText: `Let's transition to data engineering and reliability. How would you design an event-driven deduplication stream that guarantees exactly-once processing across consumer groups during broker restarts?`,
    questionType: 'PRIMARY',
    category: interview.roundType,
    topic: 'Event Streaming & Idempotency',
    difficulty: nextDifficulty,
    expectedCriteria: 'Idempotency keys, transactional outbox, Kafka offset commits, stateful stream deduplication.',
    timeLimitSeconds: 240,
    status: 'ASKED',
    askedAt: new Date(),
  };
};

/**
 * Candidate Requests Clarification
 */
export const requestClarification = async ({ interviewId, userId, questionId, candidateQuery }) => {
  const interview = await getInterviewWithOwnerCheck(interviewId, userId);
  const activeQuestion = interview.questions.find(q => q.questionId === questionId) || interview.questions[interview.questions.length - 1];

  const prompt = `Candidate is in a technical interview for ${interview.role} at ${interview.company}.
Current Question: "${activeQuestion.questionText}"
Candidate asked for clarification: "${candidateQuery}"

As the interviewer, provide a clear, concise clarification (2-3 sentences) explaining the parameters, constraints, or assumptions without giving away the solution.
Return JSON:
{
  "clarificationText": "Explanation string"
}`;

  try {
    const raw = await querySmartAI(prompt, "You are a helpful technical interviewer. Output JSON only.");
    const parsed = cleanJson(raw);
    if (parsed?.clarificationText) return parsed.clarificationText;
  } catch {}

  return `Assume the system handles peak traffic of 50,000 requests per second with a 99.9th percentile latency budget of under 100 milliseconds. You have full freedom over database and caching technology choices.`;
};

/**
 * Candidate Skips Current Question
 */
export const skipQuestion = async ({ interviewId, userId, questionId }) => {
  const interview = await getInterviewWithOwnerCheck(interviewId, userId);
  const activeQuestion = interview.questions.find(q => q.questionId === questionId) || interview.questions[interview.questions.length - 1];
  activeQuestion.status = 'SKIPPED';

  recordState(interview, 'GENERATING_NEXT_QUESTION', 'QUESTION_SKIPPED');

  const nextQuestion = await generateNextTopicQuestion({
    interview,
    lastQuestion: activeQuestion,
    evaluation: { score: 50, missedConcepts: ['Topic skipped by candidate'] }
  });

  interview.questions.push(nextQuestion);
  interview.currentQuestionId = nextQuestion.questionId;
  recordState(interview, 'WAITING_FOR_CANDIDATE', 'NEXT_QUESTION_READY');

  await saveInterview(interview);

  return {
    interview,
    nextQuestion,
  };
};

/**
 * Pause / Resume Interview Session
 */
export const toggleInterviewPause = async ({ interviewId, userId, pause = true }) => {
  const interview = await getInterviewWithOwnerCheck(interviewId, userId);
  if (pause) {
    recordState(interview, 'PAUSED', 'USER_PAUSED');
    interview.status = 'Paused';
  } else {
    recordState(interview, 'WAITING_FOR_CANDIDATE', 'USER_RESUMED');
    interview.status = 'In Progress';
  }
  await saveInterview(interview);
  return interview;
};

