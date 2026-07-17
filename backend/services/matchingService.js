import User from '../models/User.js';
import { haversine } from '../utils/haversine.js';

/**
 * Find nearby NGOs that can receive a donation
 * @param {Array} coordinates - [lng, lat] of the donation
 * @param {Number} radiusKm - Search radius in km (default 15)
 */
export const findNearbyNGOs = async (coordinates, radiusKm = 15) => {
  try {
    const ngos = await User.find({
      role: 'ngo',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: radiusKm * 1000 // Convert to meters
        }
      }
    }).limit(20);

    // Enrich with distance
    return ngos.map(ngo => {
      const distance = haversine(
        coordinates[1], coordinates[0],
        ngo.location.coordinates[1], ngo.location.coordinates[0]
      );
      return {
        ...ngo.toObject(),
        distance: Math.round(distance * 10) / 10,
        availableCapacity: ngo.capacity - ngo.currentLoad
      };
    }).sort((a, b) => {
      // Priority: emergency need first, then by available capacity & distance
      if (a.emergencyNeed && !b.emergencyNeed) return -1;
      if (!a.emergencyNeed && b.emergencyNeed) return 1;
      return a.distance - b.distance;
    });
  } catch (error) {
    console.error('Matching service error:', error.message);
    return [];
  }
};

/**
 * Auto-match a donation to the best available NGO
 */
export const autoMatch = async (donation) => {
  const ngos = await findNearbyNGOs(donation.pickupLocation.coordinates, 20);
  
  if (ngos.length === 0) return null;

  // Score each NGO
  const scored = ngos.map(ngo => {
    let score = 100;
    score -= ngo.distance * 5; // Penalize distance
    score += ngo.availableCapacity * 2; // Reward capacity
    if (ngo.emergencyNeed) score += 50; // Boost emergency
    return { ...ngo, matchScore: Math.max(0, Math.round(score)) };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored[0]; // Best match
};

export default { findNearbyNGOs, autoMatch };
