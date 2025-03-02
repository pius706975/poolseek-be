import authRouter from '@/modules/user/auth/auth.routes';
import roleRouter from '@/modules/user/role/role.routes';
import userRouter from '@/modules/user/user/user.routes';
import express from 'express';

const router = express.Router();

router.use('/role', roleRouter)
router.use('/auth', authRouter);
router.use('/user', userRouter);

export default router;
