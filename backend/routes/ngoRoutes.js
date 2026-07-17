import { Router } from 'express';
import { getNearbyDonations, getMyClaims, updateCapacity, toggleEmergency, listNGOs } from '../controllers/ngoController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.get('/list', protect, listNGOs);
router.use(protect, authorize('ngo'));

router.get('/nearby-donations', getNearbyDonations);
router.get('/claims', getMyClaims);
router.put('/capacity', updateCapacity);
router.put('/emergency', toggleEmergency);

export default router;
