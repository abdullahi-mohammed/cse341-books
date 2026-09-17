import { getDb } from '../db/connect.js';

const getAllAuthors = async () => {
    const db = getDb();
    return db.collection('authors').find({}).toArray();
};

const getAuthorById = async (authorId) => {
    const db = getDb();
    return db.collection('authors').findOne({ id: authorId });
};

const createAuthor = async (author) => {
    const db = getDb();
    await db.collection('authors').insertOne(author);
    return author;
};

const updateAuthor = async (authorId, author) => {
    const db = getDb();
    await db.collection('authors').updateOne({ id: authorId }, { $set: author });
    return { id: authorId, ...author };
};

const deleteAuthor = async (authorId) => {
    const db = getDb();
    return db.collection('authors').deleteOne({ id: authorId });
};

const authorHasBooks = async (authorId) => {
    const db = getDb();
    const count = await db.collection('books').countDocuments({ authorId });
    return count > 0;
};

export {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    authorHasBooks,
};