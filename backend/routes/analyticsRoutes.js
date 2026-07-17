import { Router } from 'express';
import { getDashboardStats, getMyStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/me', getMyStats);

export default router;
