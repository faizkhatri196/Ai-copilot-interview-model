import Interview from '../models/Interview.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/storageFallback.js';
import { generateVoiceTurn } from '../services/aiService.js';
import {
  initializeAdaptiveInterview,
  processCandidateTurn,
  getInterviewWithOwnerCheck,
  requestClarification,
  skipQuestion,
  toggleInterviewPause,
  finalizeInterview
} from '../services/interviewOrchestrator.js';

export const createInterview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      role = 'Full Stack Developer',
      difficulty = 'Intermediate',
      company = 'General Tech',
      roundType = 'Technical Fundamentals',
      interviewerPersonality = 'Professional',
      targetTurns = 5
    } = req.body;

    const interview = await initializeAdaptiveInterview({
      userId,
      role,
      company,
      difficulty,
      roundType,
      interviewerPersonality,
      targetTurns
    });

    if (isDbConnected()) {
      User.findByIdAndUpdate(userId, {
        $inc: { 'analytics.totalInterviews': 1 }
      }).catch(() => {});
    }

    res.status(201).json(interview);
  } catch (error) {
    console.error('[Interview Controller] Create error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isDbConnected()) {
      try {
        const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
        if (interviews && interviews.length > 0) return res.json(interviews);
      } catch (dbErr) {
        console.warn('[Interview Controller] DB find failed, checking fallback:', dbErr.message);
      }
    }

    const memInterviews = await memoryStore.findInterviewsByUserId(userId);
    res.json(memInterviews || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const interview = await getInterviewWithOwnerCheck(id, userId);
    res.json(interview);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const submitInterviewAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const {
      questionId,
      idempotencyKey,
      answerText,
      audioTranscript,
      codeSubmission
    } = req.body;

    const result = await processCandidateTurn({
      interviewId: id,
      userId,
      questionId,
      idempotencyKey,
      answerText,
      audioTranscript,
      codeSubmission
    });

    res.json(result);
  } catch (error) {
    console.error('[Interview Controller] Submit error:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { questionId, candidateQuery } = req.body;

    if (!candidateQuery) {
      return res.status(400).json({ message: 'Candidate query is required.' });
    }

    const clarification = await requestClarification({
      interviewId: id,
      userId,
      questionId,
      candidateQuery
    });

    res.json({ clarification });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleSkipQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { questionId } = req.body;

    const result = await skipQuestion({
      interviewId: id,
      userId,
      questionId
    });

    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleTogglePause = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { pause = true } = req.body;

    const interview = await toggleInterviewPause({
      interviewId: id,
      userId,
      pause
    });

    res.json(interview);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const handleVoiceTurn = async (req, res) => {
  try {
    const { userSpokenText, history, role, company, difficulty, roundType } = req.body;

    if (!userSpokenText || userSpokenText.trim().length === 0) {
      return res.status(400).json({ message: 'Spoken transcript is required.' });
    }

    const turn = await generateVoiceTurn({
      userSpokenText,
      history: history || [],
      role: role || 'Senior Software Engineer',
      company: company || 'Amazon',
      difficulty: difficulty || 'Senior',
      roundType: roundType || 'Technical Interview'
    });

    res.json(turn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleFinishInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const candidateId = req.user._id || req.user.id;
    const interview = await finalizeInterview({ interviewId, candidateId });
    res.json({ message: 'Interview concluded successfully', interview, isCompleted: true });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
