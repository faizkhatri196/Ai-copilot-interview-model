import Interview from '../models/Interview.js';
import User from '../models/User.js';
import CandidateMemory from '../models/CandidateMemory.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/storageFallback.js';
import { generateInterviewQuestions, evaluateAnswer, generateVoiceTurn } from '../services/aiService.js';

export const createInterview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      role = 'Full Stack Developer',
      difficulty = 'Intermediate',
      company = 'General Tech',
      roundType = 'Technical Fundamentals',
      interviewerPersonality = 'Professional'
    } = req.body;

    const questions = await generateInterviewQuestions(role, difficulty, roundType, company);

    const interviewData = {
      userId,
      role,
      company,
      difficulty,
      roundType,
      interviewerPersonality,
      questions,
      answers: [],
      finalScore: 0,
      dimensionScores: {
        technicalCorrectness: 0,
        problemSolving: 0,
        communication: 0,
        depthAndReasoning: 0,
        codeQuality: 0,
      }
    };

    if (isDbConnected()) {
      try {
        const interview = await Interview.create(interviewData);
        await User.findByIdAndUpdate(userId, {
          $inc: { 'analytics.totalInterviews': 1 }
        }).catch(() => {});
        return res.status(201).json(interview);
      } catch (dbErr) {
        console.warn('[Interview Controller] DB save failed, using fallback:', dbErr.message);
      }
    }

    // High-speed fallback store
    const memInterview = await memoryStore.createInterview(interviewData);
    res.status(201).json(memInterview);
  } catch (error) {
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

    if (isDbConnected()) {
      try {
        const interview = await Interview.findById(id);
        if (interview) return res.json(interview);
      } catch (dbErr) {
        console.warn('[Interview Controller] DB fetch failed, checking fallback:', dbErr.message);
      }
    }

    const memInterview = await memoryStore.findInterviewById(id);
    if (memInterview) return res.json(memInterview);

    res.status(404).json({ message: 'Interview session not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitInterviewAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const { questionIndex, answerText, codeSubmission, audioTranscript } = req.body;

    let interview = null;
    if (isDbConnected()) {
      try {
        interview = await Interview.findById(id);
      } catch {}
    }
    if (!interview) {
      interview = await memoryStore.findInterviewById(id);
    }

    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const question = interview.questions[questionIndex]?.questionText || "Explain your technical approach.";
    const evaluation = await evaluateAnswer(question, answerText || codeSubmission?.code || audioTranscript, interview.role, interview.roundType);

    interview.answers.push({
      questionIndex,
      answerText: answerText || audioTranscript || '',
      audioTranscript,
      codeSubmission,
      evaluation,
      submittedAt: new Date(),
    });

    const isLast = interview.answers.length >= interview.questions.length;
    if (isLast) {
      const avg = Math.round(interview.answers.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0) / interview.questions.length);
      interview.finalScore = avg;
      interview.status = 'Completed';
      interview.overallFeedback = `Interview successfully completed. Overall score: ${avg}/100. Evaluated against ${interview.company || 'Tech'} engineering benchmarks.`;
      
      interview.dimensionScores = {
        technicalCorrectness: evaluation.technicalCorrectness?.score || avg,
        problemSolving: evaluation.depthAndReasoning?.score || avg,
        communication: evaluation.communicationAndClarity?.score || avg,
        depthAndReasoning: evaluation.depthAndReasoning?.score || avg,
        codeQuality: evaluation.codeQuality?.score || avg,
      };
    }

    if (isDbConnected() && typeof interview.save === 'function') {
      try {
        await interview.save();
      } catch {}
    } else {
      await memoryStore.updateInterview(id, interview);
    }

    res.json({
      interview,
      evaluation,
      isCompleted: interview.status === 'Completed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
