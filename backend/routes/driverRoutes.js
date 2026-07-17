import { Router } from 'express';
import { toggleOnline, updateLocation, getActiveRoute, acceptDispatch, updateStopStatus, getDeliveryHistory, dispatchDriver, updateLegacyDeliveryStatus } from '../controllers/driverController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.put('/status', authorize('driver'), toggleOnline);
router.put('/location', authorize('driver'), updateLocation);
router.put('/location', authorize('driver'), updateLocation);
router.get('/active-route', authorize('driver'), getActiveRoute);
router.post('/accept/:donationId', authorize('driver'), acceptDispatch);
router.put('/route/:routeId/stop/:stopId', authorize('driver'), updateStopStatus);
router.put('/delivery/:donationId/status', authorize('driver'), updateLegacyDeliveryStatus);
router.get('/history', authorize('driver'), getDeliveryHistory);
router.post('/dispatch/:donationId', authorize('donor', 'ngo', 'admin'), dispatchDriver);

export default router;
