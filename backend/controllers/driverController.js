import User from '../models/User.js';
import Route from '../models/Route.js';
import Donation from '../models/Donation.js';
import Delivery from '../models/Delivery.js';
import { findBestDriver } from '../services/dispatchService.js';
import { sendNotification } from '../services/notificationService.js';
import { haversine, estimateTravelTime } from '../utils/haversine.js';

// @desc    Toggle driver online status
// @route   PUT /api/driver/status
export const toggleOnline = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isOnline = !user.isOnline;
    await user.save();
    res.json({ success: true, isOnline: user.isOnline });
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver location
// @route   PUT /api/driver/location
export const updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      location: { type: 'Point', coordinates }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active route for driver
// @route   GET /api/driver/active-route
export const getActiveRoute = async (req, res, next) => {
  try {
    const route = await Route.findOne({
      driver: req.user._id,
      status: { $in: ['planned', 'active'] }
    })
    .populate({
      path: 'donations',
      populate: [
        { path: 'donor', select: 'organizationName name location' },
        { path: 'matchedNGO', select: 'organizationName name location' }
      ]
    })
    .sort({ createdAt: -1 });

    res.json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a dispatch assignment
// @route   POST /api/driver/accept/:donationId
export const acceptDispatch = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate('matchedNGO', 'name organizationName location address');

    if (!donation || donation.status !== 'matched') {
      return res.status(400).json({ success: false, message: 'Donation not available for pickup' });
    }

    const driver = await User.findById(req.user._id);

    // Calculate distance & ETA
    const distance = haversine(
      driver.location.coordinates[1], driver.location.coordinates[0],
      donation.pickupLocation.coordinates[1], donation.pickupLocation.coordinates[0]
    );
    const eta = estimateTravelTime(distance);

    // Create route
    const route = await Route.create({
      driver: req.user._id,
      donations: [donation._id],
      stops: [
        {
          type: 'pickup',
          location: donation.pickupLocation,
          address: donation.pickupAddress,
          donation: donation._id,
          estimatedArrival: new Date(Date.now() + eta * 60000),
          status: 'pending'
        },
        {
          type: 'dropoff',
          location: donation.matchedNGO.location,
          address: donation.matchedNGO.address,
          donation: donation._id,
          estimatedArrival: new Date(Date.now() + (eta + 15) * 60000),
          status: 'pending'
        }
      ],
      totalDistance: Math.round(distance * 10) / 10,
      totalDuration: eta + 15,
      status: 'active',
      startedAt: new Date()
    });

    // Update donation
    donation.assignedDriver = req.user._id;
    donation.status = 'pickup_assigned';
    await donation.save();

    // Notify donor
    await sendNotification({
      recipient: donation.donor,
      type: 'driver_assigned',
      title: 'Driver Assigned',
      message: `${driver.name} is on the way — ETA ${eta} min`,
      data: { donationId: donation._id, driverId: driver._id, eta }
    });

    res.json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stop status (arrived, completed)
// @route   PUT /api/driver/route/:routeId/stop/:stopId
export const updateStopStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const route = await Route.findById(req.params.routeId);

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    const stop = route.stops.id(req.params.stopId);
    if (!stop) {
      return res.status(404).json({ success: false, message: 'Stop not found' });
    }

    stop.status = status;
    if (status === 'arrived') stop.actualArrival = new Date();

    // Sync status with the Donation document so frontend UI updates
    const donationToUpdate = await Donation.findById(stop.donation);
    if (donationToUpdate) {
      if (stop.type === 'pickup') {
        if (status === 'arrived') donationToUpdate.status = 'arrived';
        if (status === 'completed') donationToUpdate.status = 'in_transit';
      }
      await donationToUpdate.save();
    }

    // Check if all stops completed
    const allCompleted = route.stops.every(s => s.status === 'completed');
    if (allCompleted) {
      route.status = 'completed';
      route.completedAt = new Date();

      // Update driver stats
      const driver = await User.findById(req.user._id);
      driver.completedDeliveries += 1;
      driver.totalDistance += route.totalDistance;
      await driver.save();

      // Create delivery record & update donation
      for (const donationId of route.donations) {
        const donation = await Donation.findById(donationId);
        if (donation) {
          donation.status = 'delivered';
          donation.deliveredAt = new Date();
          await donation.save();

          await Delivery.create({
            donation: donationId,
            route: route._id,
            driver: req.user._id,
            donor: donation.donor,
            ngo: donation.matchedNGO,
            status: 'delivered',
            pickupTime: donation.pickedUpAt,
            deliveryTime: new Date(),
            distance: route.totalDistance,
            duration: route.totalDuration,
            carbonSaved: donation.carbonSaved,
            mealsDelivered: donation.totalServings
          });

          // Notify donor
          await sendNotification({
            recipient: donation.donor,
            type: 'delivered',
            title: 'Delivery Complete! 🎉',
            message: `Your donation of ${donation.totalServings} meals has been delivered successfully`,
            data: { donationId }
          });
        }
      }
    }

    await route.save();
    res.json({ success: true, route });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver delivery history
// @route   GET /api/driver/history
export const getDeliveryHistory = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find({ driver: req.user._id })
      .populate('donation', 'items totalServings')
      .populate('donor', 'name organizationName')
      .populate('ngo', 'name organizationName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, deliveries });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch a driver to a matched donation
// @route   POST /api/driver/dispatch/:donationId
export const dispatchDriver = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation || donation.status !== 'matched') {
      return res.status(400).json({ success: false, message: 'Donation not ready for dispatch' });
    }

    const result = await findBestDriver(donation.pickupLocation.coordinates);
    if (!result) {
      return res.status(404).json({ success: false, message: 'No drivers available nearby' });
    }

    // Notify the driver
    await sendNotification({
      recipient: result.driver._id,
      type: 'driver_assigned',
      title: 'New Pickup Request',
      message: `Pickup ${result.distance}km away — ETA ${result.eta} min`,
      data: { donationId: donation._id, distance: result.distance, eta: result.eta }
    });

    res.json({
      success: true,
      driver: {
        id: result.driver._id,
        name: result.driver.name,
        distance: result.distance,
        eta: result.eta,
        score: result.score
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status (Wrapper for frontend)
// @route   PUT /api/driver/delivery/:donationId/status
export const updateLegacyDeliveryStatus = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;
    
    // Find active route for this driver and donation
    const route = await Route.findOne({
      driver: req.user._id,
      donations: donationId,
      status: { $in: ['planned', 'active'] }
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Active route not found for this donation' });
    }

    // Map legacy status to stop updates
    // statusFlow = ['pickup_assigned', 'arrived', 'in_transit', 'delivered']
    let stopId;
    let stopStatus;

    if (status === 'arrived') {
      const pickupStop = route.stops.find(s => s.type === 'pickup' && s.donation.toString() === donationId);
      stopId = pickupStop._id;
      stopStatus = 'arrived';
    } else if (status === 'in_transit') {
      const pickupStop = route.stops.find(s => s.type === 'pickup' && s.donation.toString() === donationId);
      stopId = pickupStop._id;
      stopStatus = 'completed';
    } else if (status === 'delivered') {
      const dropoffStop = route.stops.find(s => s.type === 'dropoff' && s.donation.toString() === donationId);
      stopId = dropoffStop._id;
      stopStatus = 'completed';
    } else {
      return res.json({ success: true, message: 'Status mapped to internal' }); // ignore pickup_assigned
    }

    // Proxy the request to the existing updateStopStatus controller
    req.params.routeId = route._id;
    req.params.stopId = stopId;
    req.body.status = stopStatus;

    return await updateStopStatus(req, res, next);

  } catch (error) {
    next(error);
  }
};
