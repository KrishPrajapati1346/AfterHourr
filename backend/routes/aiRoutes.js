import { Router } from 'express';
import { parseFood } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/parse-food', protect, parseFood);

export default router;
