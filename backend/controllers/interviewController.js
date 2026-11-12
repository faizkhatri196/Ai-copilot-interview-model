import Interview from '../models/Interview.js';
import User from '../models/User.js';
import CandidateMemory from '../models/CandidateMemory.js';
import { generateInterviewQuestions, evaluateAnswer } from '../services/aiService.js';

export const createInterview = async (req, res) => {
  try {
    const {
      role = 'Full Stack Developer',
      difficulty = 'Intermediate',
      company = 'General Tech',
      roundType = 'Technical Fundamentals',
      interviewerPersonality = 'Professional'
    } = req.body;

    const questions = await generateInterviewQuestions(role, difficulty, roundType, company);

    const interview = await Interview.create({
      userId: req.user._id,
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
    });

    // Increment user interview count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'analytics.totalInterviews': 1 }
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitInterviewAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, answerText, codeSubmission, audioTranscript } = req.body;

    const interview = await Interview.findById(id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const question = interview.questions[questionIndex]?.questionText || "Explain your technical approach.";
    
    // Evaluate answer with multi-dimensional rubric
    const evaluation = await evaluateAnswer(question, answerText || codeSubmission?.code || audioTranscript, interview.role, interview.roundType);

    interview.answers.push({
      questionIndex,
      answerText: answerText || audioTranscript || '',
      audioTranscript,
      codeSubmission,
      evaluation,
      submittedAt: new Date(),
    });

    // Check if session completed
    if (interview.answers.length >= interview.questions.length) {
      const avg = Math.round(interview.answers.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0) / interview.questions.length);
      interview.finalScore = avg;
      interview.status = 'Completed';
      interview.overallFeedback = `Interview successfully completed. Overall score: ${avg}/100. Strongest performance in conceptual communication with key growth opportunities in boundary constraints.`;
      
      interview.dimensionScores = {
        technicalCorrectness: evaluation.technicalCorrectness?.score || avg,
        problemSolving: evaluation.depthAndReasoning?.score || avg,
        communication: evaluation.communicationAndClarity?.score || avg,
        depthAndReasoning: evaluation.depthAndReasoning?.score || avg,
        codeQuality: evaluation.codeQuality?.score || avg,
      };

      // Update candidate memory
      await CandidateMemory.findOneAndUpdate(
        { userId: req.user._id },
        {
          $inc: { totalInterviewsCompleted: 1 },
          $push: {
            historicalScores: {
              interviewId: interview._id,
              date: new Date(),
              overallScore: avg,
              role: interview.role,
              roundType: interview.roundType,
            }
          }
        },
        { upsert: true }
      );
    }

    await interview.save();
    res.json({
      interview,
      evaluation,
      isCompleted: interview.status === 'Completed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
