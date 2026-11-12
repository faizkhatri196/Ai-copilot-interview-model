import express from 'express';
import { getCandidateAnalytics, getPreparationRoadmap, updateRoadmapTask } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/overview', protect, getCandidateAnalytics);
router.get('/roadmap', protect, getPreparationRoadmap);
router.post('/roadmap/task', protect, updateRoadmapTask);

export default router;

