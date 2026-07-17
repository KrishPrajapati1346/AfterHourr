import { Router } from 'express';
import { createDonation, getDonations, getDonation, updateDonationStatus, claimDonation } from '../controllers/donationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getDonations)
  .post(authorize('donor', 'admin'), createDonation);

router.route('/:id')
  .get(getDonation);

router.put('/:id/status', authorize('driver', 'admin'), updateDonationStatus);
router.post('/:id/claim', authorize('ngo'), claimDonation);

export default router;
