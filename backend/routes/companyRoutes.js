import express from 'express';
import { getCompanies, getCompanyBySlug, refreshCompanyResearch } from '../controllers/companyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCompanies);
router.get('/:slug', getCompanyBySlug);
router.post('/:slug/refresh', protect, refreshCompanyResearch);

export default router;

