import express from 'express';
import { getBooks, addBook, borrowBook } from '../controllers/libraryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getBooks)
    .post(protect, addBook);

router.post('/:id/borrow', protect, borrowBook);

export default router;
