import express from 'express';
import { createInterview, getInterviewHistory, getInterviewById } from '../controllers/interviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createInterview);
router.get('/history', protect, getInterviewHistory);
router.get('/:id', protect, getInterviewById);

export default router;
