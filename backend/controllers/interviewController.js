import Interview from '../models/Interview.js';
import { generateInterviewQuestions } from '../services/aiService.js';

export const createInterview = async (req, res) => {
  try {
    const { role, difficulty } = req.body;

    const questions = await generateInterviewQuestions(role, difficulty);

    const interview = await Interview.create({
      userId: req.user._id,
      role,
      difficulty,
      questions,
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
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
