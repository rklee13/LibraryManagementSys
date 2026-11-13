import express from 'express';

import UserController from '../controllers/UserController';

import { Schemas, ValidateSchema } from '../middlewares/Validation';
import { authenticateUser, requireAdmin } from '../middlewares/Authentication';

const router = express.Router();

router.get('/', authenticateUser, requireAdmin, UserController.getAllUsers);
router.get('/:userId', ValidateSchema(Schemas.user.userId, 'params'), UserController.getUserById);
router.put('/', authenticateUser, ValidateSchema(Schemas.user.update, 'body'), UserController.updateUser);
router.post('/', authenticateUser, requireAdmin, ValidateSchema(Schemas.user.adminCreate, 'body'), UserController.createUser);
router.delete('/:userId', authenticateUser, requireAdmin, ValidateSchema(Schemas.user.userId, 'params'), UserController.deleteUser);

export = router;