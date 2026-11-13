import express from 'express';
import {
  getChallenges,
  getChallengeBySlug,
  runCodeSubmission,
  generateCustomChallenge
} from '../controllers/codingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getChallenges);
router.post('/generate', protect, generateCustomChallenge);
router.get('/:slug', getChallengeBySlug);
router.post('/:slug/submit', protect, runCodeSubmission);

export default router;

