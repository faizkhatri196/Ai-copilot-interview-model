import express from 'express';
import {
  createInterview,
  getInterviewHistory,
  getInterviewById,
  submitInterviewAnswer,
  handleVoiceTurn,
} from '../controllers/interviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createInterview);
router.get('/history', protect, getInterviewHistory);
router.post('/voice-turn', protect, handleVoiceTurn);
router.get('/:id', protect, getInterviewById);
router.post('/:id/submit', protect, submitInterviewAnswer);

export default router;
