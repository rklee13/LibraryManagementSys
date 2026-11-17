import express from 'express';
import BookController from '../controllers/BookController';
import { Schemas, ValidateSchema } from '../middlewares/Validation';
import { authenticateUser, requireLibrarian } from '../middlewares/Authentication';
import type { RequestHandler } from 'express';

const router = express.Router();

const authenticateForHistory: RequestHandler = (req, res, next) => {
    if (req.body?.userId) {
        return authenticateUser(req, res, next);
    }
    next();
};

router.post('/ai-recommend', ValidateSchema(Schemas.book.aiRecommend, 'body'), authenticateForHistory, BookController.recommendBooksHandler);
router.get('/facets', BookController.getBookFacetsHandler);
router.get('/', BookController.getAllBooks);
router.post('/', authenticateUser, requireLibrarian, ValidateSchema(Schemas.book.create, 'body'), BookController.createBook);
router.put('/:bookId', authenticateUser, requireLibrarian, ValidateSchema(Schemas.book.bookId, 'params'), ValidateSchema(Schemas.book.update, 'body'), BookController.updateBook);
router.delete('/:bookId', authenticateUser, requireLibrarian, ValidateSchema(Schemas.book.delete, 'params'), BookController.deleteBook);

router.get('/query', BookController.searchForBooksByQuery);

export = router;