import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { findNearbyNGOs } from '../services/matchingService.js';

// @desc    Get nearby donations for NGO
// @route   GET /api/ngo/nearby-donations
export const getNearbyDonations = async (req, res, next) => {
  try {
    const ngo = await User.findById(req.user._id);
    const { radius = 15, lat, lng } = req.query;

    let searchCoords = ngo.location.coordinates;
    if (lat && lng) {
      searchCoords = [parseFloat(lng), parseFloat(lat)];
    }

    const donations = await Donation.find({
      status: 'pending',
      pickupLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: searchCoords
          },
          $maxDistance: parseInt(radius) * 1000
        }
      }
    })
    .populate('donor', 'name organizationName address phone location')
    .sort({ createdAt: -1 })
    .limit(30);

    res.json({ success: true, donations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get NGO's claimed donations
// @route   GET /api/ngo/claims
export const getMyClaims = async (req, res, next) => {
  try {
    const donations = await Donation.find({
      matchedNGO: req.user._id,
      status: { $in: ['matched', 'pickup_assigned', 'arrived', 'in_transit', 'delivered'] }
    })
    .populate('donor', 'name organizationName address phone location')
    .populate('assignedDriver', 'name phone vehicleType location')
    .sort({ claimedAt: -1 });

    res.json({ success: true, donations });
  } catch (error) {
    next(error);
  }
};

// @desc    Update NGO capacity
// @route   PUT /api/ngo/capacity
export const updateCapacity = async (req, res, next) => {
  try {
    const { capacity, currentLoad } = req.body;
    const updates = {};
    if (capacity !== undefined) updates.capacity = capacity;
    if (currentLoad !== undefined) updates.currentLoad = currentLoad;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle emergency need
// @route   PUT /api/ngo/emergency
export const toggleEmergency = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.emergencyNeed = !user.emergencyNeed;
    await user.save();

    res.json({ success: true, emergencyNeed: user.emergencyNeed });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all NGOs (for map/listing)
// @route   GET /api/ngo/list
export const listNGOs = async (req, res, next) => {
  try {
    const { lat, lng, radius = 20 } = req.query;
    let query = { role: 'ngo', isActive: true };

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) * 1000
        }
      };
    }

    const ngos = await User.find(query)
      .select('name organizationName location address capacity currentLoad emergencyNeed')
      .limit(50);

    res.json({ success: true, ngos });
  } catch (error) {
    next(error);
  }
};
