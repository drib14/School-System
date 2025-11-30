import express from 'express';
import { getFinance } from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getFinance);

export default router;
