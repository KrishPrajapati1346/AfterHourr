import Donation from '../models/Donation.js';
import Delivery from '../models/Delivery.js';
import User from '../models/User.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
    const activeDonations = await Donation.countDocuments({ status: { $in: ['pending', 'matched', 'pickup_assigned', 'in_transit'] } });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const totalDonors = await User.countDocuments({ role: 'donor' });

    // Aggregate metrics
    const metrics = await Donation.aggregate([
      { $match: { status: 'delivered' } },
      { $group: {
        _id: null,
        totalMeals: { $sum: '$totalServings' },
        totalCarbon: { $sum: '$carbonSaved' },
        totalValue: { $sum: '$estimatedValue' }
      }}
    ]);

    const m = metrics[0] || { totalMeals: 0, totalCarbon: 0, totalValue: 0 };

    // Meals over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const mealsOverTime = await Donation.aggregate([
      { $match: { status: 'delivered', deliveredAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$deliveredAt' } },
        meals: { $sum: '$totalServings' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalDonations, deliveredDonations, activeDonations,
        totalDrivers, totalNGOs, totalDonors,
        totalMeals: m.totalMeals,
        totalCarbon: Math.round(m.totalCarbon * 10) / 10,
        totalValue: Math.round(m.totalValue),
        mealsOverTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user-specific analytics
// @route   GET /api/analytics/me
export const getMyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let stats = {};

    if (role === 'donor') {
      const donations = await Donation.find({ donor: userId });
      const delivered = donations.filter(d => d.status === 'delivered');
      stats = {
        totalDonations: donations.length,
        deliveredCount: delivered.length,
        totalMeals: delivered.reduce((s, d) => s + d.totalServings, 0),
        totalCarbon: Math.round(delivered.reduce((s, d) => s + d.carbonSaved, 0) * 10) / 10,
        totalValue: Math.round(delivered.reduce((s, d) => s + d.estimatedValue, 0)),
        activeCount: donations.filter(d => ['pending','matched','pickup_assigned','in_transit'].includes(d.status)).length
      };
    } else if (role === 'ngo') {
      const claims = await Donation.find({ matchedNGO: userId });
      const delivered = claims.filter(d => d.status === 'delivered');
      stats = {
        totalClaimed: claims.length,
        receivedCount: delivered.length,
        totalMealsReceived: delivered.reduce((s, d) => s + d.totalServings, 0),
        pendingDeliveries: claims.filter(d => ['matched','pickup_assigned','in_transit'].includes(d.status)).length
      };
    } else if (role === 'driver') {
      const deliveries = await Delivery.find({ driver: userId });
      const user = await User.findById(userId);
      stats = {
        totalDeliveries: deliveries.length,
        totalDistance: Math.round((user.totalDistance || 0) * 10) / 10,
        totalMealsDelivered: deliveries.reduce((s, d) => s + d.mealsDelivered, 0),
        rating: user.rating,
        completedDeliveries: user.completedDeliveries
      };
    }

    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};
