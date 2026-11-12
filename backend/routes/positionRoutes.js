import express from 'express';
import { getPositions, getPositionBySlug } from '../controllers/positionController.js';

const router = express.Router();

router.get('/', getPositions);
router.get('/:slug', getPositionBySlug);

export default router;

