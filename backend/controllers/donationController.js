import Donation from '../models/Donation.js';
import { findNearbyNGOs } from '../services/matchingService.js';
import { sendNotification } from '../services/notificationService.js';
import { parseFoodDescription } from '../services/geminiService.js';
import User from '../models/User.js';
import { findBestDriver } from '../services/dispatchService.js';

// @desc    Create a new donation
// @route   POST /api/donations
export const createDonation = async (req, res, next) => {
  try {
    const { items, rawDescription, pickupAddress, pickupWindow, pickupLocation } = req.body;

    let parsedItems = items;
    let aiParsed = false;
    let totalServings = 0;
    let estimatedValue = 0;
    let carbonSaved = 0;

    // If raw description provided, use AI parsing
    if (rawDescription && (!items || items.length === 0)) {
      const aiResult = await parseFoodDescription(rawDescription);
      parsedItems = aiResult.items;
      totalServings = aiResult.totalServings;
      estimatedValue = aiResult.estimatedValue;
      carbonSaved = aiResult.carbonSaved;
      aiParsed = true;
    } else {
      totalServings = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
      estimatedValue = Math.round(totalServings * 2.5);
      carbonSaved = Math.round(totalServings * 0.3 * 10) / 10;
    }

    // Use donor's location as default pickup
    const donor = await User.findById(req.user._id);
    const location = pickupLocation || donor.location;

    const donation = await Donation.create({
      donor: req.user._id,
      items: parsedItems,
      totalServings,
      rawDescription,
      aiParsed,
      pickupLocation: location,
      pickupAddress: pickupAddress || donor.address,
      pickupWindow: pickupWindow || {
        start: new Date(),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000)
      },
      estimatedValue,
      carbonSaved
    });

    // Find and notify nearby NGOs
    const nearbyNGOs = await findNearbyNGOs(location.coordinates, 15);
    for (const ngo of nearbyNGOs.slice(0, 5)) {
      await sendNotification({
        recipient: ngo._id,
        type: 'new_donation_nearby',
        title: 'New Food Available Nearby',
        message: `${donor.organizationName || donor.name} has ${totalServings} servings available — ${Math.round(ngo.distance)}km away`,
        data: { donationId: donation._id, distance: ngo.distance }
      });
    }

    const populated = await Donation.findById(donation._id).populate('donor', 'name organizationName address');
    res.status(201).json({ success: true, donation: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations (with filters)
// @route   GET /api/donations
export const getDonations = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1, nearby, lat, lng, radius } = req.query;
    const query = {};

    if (status) query.status = status;

    // Role-based filtering
    if (req.user.role === 'donor') {
      query.donor = req.user._id;
    }

    // Geospatial filtering
    if (nearby === 'true' && lat && lng) {
      query.pickupLocation = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: (parseFloat(radius) || 15) * 1000
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const donations = await Donation.find(query)
      .populate('donor', 'name organizationName address phone location')
      .populate('matchedNGO', 'name organizationName address location')
      .populate('assignedDriver', 'name phone vehicleType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      donations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
export const getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name organizationName address phone location')
      .populate('matchedNGO', 'name organizationName address phone location')
      .populate('assignedDriver', 'name phone vehicleType location');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id/status
export const updateDonationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.status = status;

    if (status === 'delivered') {
      donation.deliveredAt = new Date();
    } else if (status === 'in_transit') {
      donation.pickedUpAt = new Date();
    }

    await donation.save();

    // Notify relevant parties
    if (donation.donor) {
      await sendNotification({
        recipient: donation.donor,
        type: status === 'delivered' ? 'delivered' : 'donation_matched',
        title: `Donation ${status.replace('_', ' ')}`,
        message: `Your donation status has been updated to: ${status}`,
        data: { donationId: donation._id, status }
      });
    }

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name organizationName')
      .populate('matchedNGO', 'name organizationName')
      .populate('assignedDriver', 'name phone');

    res.json({ success: true, donation: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim a donation (NGO)
// @route   POST /api/donations/:id/claim
export const claimDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Donation is no longer available' });
    }

    donation.matchedNGO = req.user._id;
    donation.status = 'matched';
    donation.claimedAt = new Date();
    await donation.save();

    // Notify donor
    const ngo = await User.findById(req.user._id);
    await sendNotification({
      recipient: donation.donor,
      type: 'donation_claimed',
      title: 'Donation Claimed!',
      message: `${ngo.organizationName || ngo.name} has claimed your donation`,
      data: { donationId: donation._id, ngoId: req.user._id }
    });

    // Auto-dispatch nearby driver
    try {
      const dispatchResult = await findBestDriver(donation.pickupLocation.coordinates);
      if (dispatchResult) {
        await sendNotification({
          recipient: dispatchResult.driver._id,
          type: 'driver_assigned',
          title: 'New Pickup Request',
          message: `Pickup ${dispatchResult.distance}km away — ETA ${dispatchResult.eta} min`,
          data: { donationId: donation._id, distance: dispatchResult.distance, eta: dispatchResult.eta }
        });
        console.log(`🚚 Dispatched driver ${dispatchResult.driver.name} for donation ${donation._id}`);
      } else {
        console.log(`⚠️ No active/online drivers found nearby for donation ${donation._id}`);
      }
    } catch (dispatchErr) {
      console.error('Auto-dispatch failed:', dispatchErr.message);
    }

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name organizationName address phone location')
      .populate('matchedNGO', 'name organizationName address phone location');

    res.json({ success: true, donation: populated });
  } catch (error) {
    next(error);
  }
};
