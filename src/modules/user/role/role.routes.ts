import express from 'express';
import roleController from './role.controller';

const roleRouter = express.Router();

roleRouter.post('/create', roleController.create);
roleRouter.get('/', roleController.getRoles);
roleRouter.get('/:id', roleController.getRoleById);
roleRouter.delete('/delete/:id', roleController.delete);

export default roleRouter;
