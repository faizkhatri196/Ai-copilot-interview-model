import express from 'express';
import {
  createInterview,
  getInterviewHistory,
  getInterviewById,
  submitInterviewAnswer,
  handleClarification,
  handleSkipQuestion,
  handleTogglePause,
  handleVoiceTurn,
  handleFinishInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createInterview);
router.get('/history', protect, getInterviewHistory);
router.post('/voice-turn', protect, handleVoiceTurn);
router.get('/:id', protect, getInterviewById);
router.post('/:id/submit', protect, submitInterviewAnswer);
router.post('/:id/clarify', protect, handleClarification);
router.post('/:id/skip', protect, handleSkipQuestion);
router.post('/:id/pause', protect, handleTogglePause);
router.post('/:id/finish', protect, handleFinishInterview);

export default router;
