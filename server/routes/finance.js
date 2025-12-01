import express from 'express';
import { getFinance, createFinance, updateFinance } from '../controllers/financeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getFinance)
    .post(protect, admin, createFinance);

router.route('/:id')
    .put(protect, admin, updateFinance);

export default router;
