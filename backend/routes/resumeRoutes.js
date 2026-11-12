import express from 'express';
import {
  uploadAndAnalyzeResume,
  getCandidateResumes,
  getResumeById,
  compareResumes,
} from '../controllers/resumeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, uploadAndAnalyzeResume);
router.get('/', protect, getCandidateResumes);
router.get('/compare', protect, compareResumes);
router.get('/:id', protect, getResumeById);

export default router;

