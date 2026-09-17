import {
    getAllBooks,
    getBookById,
    createBook as createBookInDb,
    updateBook as updateBookInDb,
    deleteBook as deleteBookFromDb,
    authorExists,
} from '../models/books.js';

const hasRequiredBookFields = (body, includeId) => {
    const hasId = !includeId || (typeof body?.id === 'string' && body.id.trim() !== '');
    return hasId
        && typeof body?.authorId === 'string' && body.authorId.trim() !== ''
        && typeof body?.title === 'string' && body.title.trim() !== ''
        && typeof body?.publicationDate === 'string' && body.publicationDate.trim() !== '';
};

const getBooksHandler = async (req, res) => {
    try {
        const books = await getAllBooks();
        return res.status(200).json(books);
    } catch (error) {
        console.error('GET /books failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getBookByIdHandler = async (req, res) => {
    const requestedId = req.params.id;

    try {
        const book = await getBookById(requestedId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.error('GET /books/:id failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const createBookHandler = async (req, res) => {
    if (!hasRequiredBookFields(req.body, true)) {
        return res.status(400).json({ message: 'Missing required book fields' });
    }

    try {
        const { id, authorId, title, publicationDate } = req.body;
        if (await getBookById(id)) {
            return res.status(400).json({ message: 'Book id already exists' });
        }

        if (!await authorExists(authorId)) {
            return res.status(400).json({ message: 'Author not found' });
        }

        const book = await createBookInDb({ id, authorId, title, publicationDate });
        return res.status(201).json(book);
    } catch (error) {
        console.error('POST /books failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateBookHandler = async (req, res) => {
    if (!hasRequiredBookFields(req.body, false)) {
        return res.status(400).json({ message: 'Missing required book fields' });
    }

    try {
        const { id } = req.params;
        if (!await getBookById(id)) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const { authorId, title, publicationDate } = req.body;
        if (!await authorExists(authorId)) {
            return res.status(400).json({ message: 'Author not found' });
        }

        const book = await updateBookInDb(id, { authorId, title, publicationDate });
        return res.status(200).json(book);
    } catch (error) {
        console.error('PUT /books/:id failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteBookHandler = async (req, res) => {
    try {
        const result = await deleteBookFromDb(req.params.id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('DELETE /books/:id failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export {
    getBooksHandler,
    getBookByIdHandler,
    createBookHandler,
    updateBookHandler,
    deleteBookHandler,
};