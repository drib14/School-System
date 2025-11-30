import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';

// @desc    Get all books
// @route   GET /api/library
// @access  Private
const getBooks = asyncHandler(async (req, res) => {
    const books = await Book.find({});
    res.json(books);
});

// @desc    Add a book
// @route   POST /api/library
// @access  Private (Admin/Librarian)
const addBook = asyncHandler(async (req, res) => {
    const { title, author, isbn } = req.body;
    const book = await Book.create({ title, author, isbn });
    res.status(201).json(book);
});

// @desc    Borrow a book
// @route   POST /api/library/:id/borrow
// @access  Private (Student)
const borrowBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (book && book.status === 'Available') {
        book.status = 'Borrowed';
        book.borrowedBy = req.user._id;
        book.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await book.save();
        res.json(book);
    } else {
        res.status(400);
        throw new Error('Book not available');
    }
});

export { getBooks, addBook, borrowBook };
