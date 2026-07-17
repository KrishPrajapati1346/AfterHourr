import { Router } from 'express';
import { register, login, getMe, updateProfile, googleLogin, googleRegister } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google/login', authLimiter, googleLogin);
router.post('/google/register', authLimiter, googleRegister);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
