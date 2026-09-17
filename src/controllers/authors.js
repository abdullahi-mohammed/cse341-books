import {
    getAllAuthors as getAllAuthorsFromDb,
    getAuthorById as getAuthorByIdFromDb,
    createAuthor as createAuthorInDb,
    updateAuthor as updateAuthorInDb,
    deleteAuthor as deleteAuthorFromDb,
    authorHasBooks,
} from '../models/authors.js';

const hasRequiredAuthorFields = (body) => {
    return typeof body?.firstName === 'string' && body.firstName.trim() !== ''
        && typeof body?.lastName === 'string' && body.lastName.trim() !== '';
};

const getAllAuthors = async (req, res) => {
    try {
        const authors = await getAllAuthorsFromDb();
        return res.status(200).json(authors);
    } catch (error) {
        console.error('GET /authors failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAuthorById = async (req, res) => {
    try {
        const author = await getAuthorByIdFromDb(req.params.id);

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        return res.status(200).json(author);
    } catch (error) {
        console.error('GET /authors/:id failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const createAuthor = async (req, res) => {
    const { id, firstName, lastName } = req.body ?? {};

    if (typeof id !== 'string' || id.trim() === '' || !hasRequiredAuthorFields(req.body)) {
        return res.status(400).json({ message: 'Missing required author fields' });
    }

    try {
        if (await getAuthorByIdFromDb(id)) {
            return res.status(400).json({ message: 'Author id already exists' });
        }

        const author = await createAuthorInDb({ id, firstName, lastName });
        return res.status(201).json(author);
    } catch (error) {
        console.error('POST /authors failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateAuthor = async (req, res) => {
    if (!hasRequiredAuthorFields(req.body)) {
        return res.status(400).json({ message: 'Missing required author fields' });
    }

    try {
        const author = await getAuthorByIdFromDb(req.params.id);

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        const { firstName, lastName } = req.body;
        const updatedAuthor = await updateAuthorInDb(req.params.id, { firstName, lastName });
        return res.status(200).json(updatedAuthor);
    } catch (error) {
        console.error('PUT /authors/:id failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAuthor = async (req, res) => {
    try {
        const author = await getAuthorByIdFromDb(req.params.id);

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        if (await authorHasBooks(req.params.id)) {
            return res.status(409).json({
                error: 'Cannot delete author while books reference this author',
            });
        }

        await deleteAuthorFromDb(req.params.id);
        return res.status(204).send();
    } catch (error) {
        console.error('DELETE /authors/:id failed:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };