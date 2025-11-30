import mongoose from 'mongoose';

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Available', 'Borrowed'], default: 'Available' },
    borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
