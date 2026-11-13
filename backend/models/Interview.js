import mongoose from 'mongoose';

export const INTERVIEW_STATES = [
  'CREATED',
  'INITIALIZING',
  'QUESTION_PENDING',
  'WAITING_FOR_CANDIDATE',
  'PROCESSING_RESPONSE',
  'ANALYZING_RESPONSE',
  'GENERATING_FOLLOWUP',
  'GENERATING_NEXT_QUESTION',
  'QUESTION_READY',
  'ROUND_TRANSITION',
  'COMPLETED',
  'PAUSED',
  'FAILED'
];

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    index: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['PRIMARY', 'FOLLOW_UP', 'CLARIFICATION', 'PROJECT_DRILL_DOWN', 'CHALLENGE'],
    default: 'PRIMARY',
  },
  parentQuestionId: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: 'General Technical',
  },
  topic: {
    type: String,
    default: 'Software Engineering',
  },
  difficulty: {
    type: String,
    enum: ['Fresher', 'Intermediate', 'Senior', 'Staff'],
    default: 'Intermediate',
  },
  expectedCriteria: {
    type: String,
    default: '',
  },
  timeLimitSeconds: {
    type: Number,
    default: 180,
  },
  status: {
    type: String,
    enum: ['ASKED', 'ANSWERED', 'SKIPPED'],
    default: 'ASKED',
  },
  followUpQuestions: [String],
  sourceEvidence: {
    type: String,
    default: '',
  },
  askedAt: {
    type: Date,
    default: Date.now,
  },
});

const answerSchema = new mongoose.Schema({
  answerId: {
    type: String,
    required: true,
  },
  questionId: {
    type: String,
    required: true,
  },
  idempotencyKey: {
    type: String,
    index: true,
  },
  answerText: {
    type: String,
    default: '',
  },
  audioTranscript: {
    type: String,
    default: '',
  },
  codeSubmission: {
    code: String,
    language: String,
    testsPassed: Number,
    testsTotal: Number,
    runtimeMs: Number,
    memoryMb: Number,
    status: String,
    errorMessage: String,
  },
  evaluation: {
    score: Number,
    technicalCorrectness: {
      score: Number,
      notes: String,
    },
    communicationAndClarity: {
      score: Number,
      notes: String,
    },
    depthAndReasoning: {
      score: Number,
      notes: String,
    },
    codeQuality: {
      score: Number,
      notes: String,
    },
    feedback: String,
    correctness: String,
    clarity: String,
    missedConcepts: [String],
    positiveObservations: [String],
    suggestedBetterAnswer: String,
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const stateHistorySchema = new mongoose.Schema({
  fromState: {
    type: String,
    enum: INTERVIEW_STATES,
  },
  toState: {
    type: String,
    enum: INTERVIEW_STATES,
    required: true,
  },
  trigger: {
    type: String,
    default: 'SYSTEM_EVENT',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: 'General Tech',
  },
  difficulty: {
    type: String,
    enum: ['Fresher', 'Intermediate', 'Senior', 'Staff', 'Beginner', 'Advanced'],
    default: 'Intermediate',
  },
  interviewerPersonality: {
    type: String,
    enum: ['Professional', 'Friendly', 'Strict', 'Senior Engineer', 'Behavioral'],
    default: 'Professional',
  },
  roundType: {
    type: String,
    enum: [
      'Technical Interview',
      'Online Assessment',
      'DSA Coding Interview',
      'Technical Fundamentals',
      'Resume-Based Interview',
      'Company-Specific Interview',
      'System Design',
      'Behavioral Interview',
      'HR Interview',
      'AI Voice Interview',
      'Full Multi-Round Simulation'
    ],
    default: 'Technical Fundamentals',
  },
  roundIndex: {
    type: Number,
    default: 1,
  },
  totalRounds: {
    type: Number,
    default: 1,
  },
  currentState: {
    type: String,
    enum: INTERVIEW_STATES,
    default: 'INITIALIZING',
    index: true,
  },
  stateHistory: [stateHistorySchema],
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Paused', 'Cancelled', 'Failed'],
    default: 'In Progress',
    index: true,
  },
  currentQuestionId: {
    type: String,
    default: null,
  },
  questions: [questionSchema],
  answers: [answerSchema],
  processedIdempotencyKeys: [{
    type: String,
    index: true,
  }],
  // Compact rolling memory context to minimize AI token payload
  compactContext: {
    candidateSummary: String,
    topicsCovered: [String],
    demonstratedStrengths: [String],
    criticalWeaknesses: [String],
    lastDrillDownTopic: String,
    consecutivePoorAnswers: {
      type: Number,
      default: 0,
    },
    consecutiveStrongAnswers: {
      type: Number,
      default: 0,
    },
    resumeAnchorProject: String,
  },
  finalScore: {
    type: Number,
    default: 0,
  },
  dimensionScores: {
    technicalCorrectness: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    depthAndReasoning: { type: Number, default: 0 },
    codeQuality: { type: Number, default: 0 },
    behavioralRelevance: { type: Number, default: 0 },
  },
  overallFeedback: {
    type: String,
    default: '',
  },
  strengthsIdentified: [String],
  criticalGapsIdentified: [String],
  recommendedFocusTopics: [String],
  sessionDurationSeconds: {
    type: Number,
    default: 0,
  },
  version: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

// Compound indexes for high-throughput queries
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, roundType: 1 });
interviewSchema.index({ company: 1, role: 1 });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
