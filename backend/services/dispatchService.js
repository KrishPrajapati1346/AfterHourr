import User from '../models/User.js';
import Route from '../models/Route.js';
import { haversine, optimizeRoute, estimateTravelTime } from '../utils/haversine.js';

/**
 * Find the best available driver for a pickup
 */
export const findBestDriver = async (pickupCoordinates) => {
  const drivers = await User.find({
    role: 'driver',
    isActive: true,
    isOnline: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: pickupCoordinates
        },
        $maxDistance: 20000 // 20km
      }
    }
  }).limit(10);

  if (drivers.length === 0) return null;

  // Check which drivers don't have active routes
  const activeRouteDriverIds = (await Route.find({
    status: 'active',
    driver: { $in: drivers.map(d => d._id) }
  }).select('driver')).map(r => r.driver.toString());

  // Score drivers
  const scored = drivers.map(driver => {
    const distance = haversine(
      pickupCoordinates[1], pickupCoordinates[0],
      driver.location.coordinates[1], driver.location.coordinates[0]
    );
    
    let score = 100;
    score -= distance * 10; // Penalize distance heavily
    score += driver.rating * 5; // Reward good rating
    score += Math.min(driver.completedDeliveries, 50); // Experience bonus
    
    // Heavy penalty if already on a route
    if (activeRouteDriverIds.includes(driver._id.toString())) {
      score -= 50;
    }
    
    return {
      driver,
      distance: Math.round(distance * 10) / 10,
      eta: estimateTravelTime(distance),
      score: Math.round(score)
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
};

/**
 * Create an optimized route for a driver with multiple stops
 */
export const createOptimizedRoute = async (driverLocation, stops) => {
  const start = {
    lat: driverLocation[1],
    lng: driverLocation[0]
  };

  const stopsWithCoords = stops.map(s => ({
    ...s,
    lat: s.coordinates[1],
    lng: s.coordinates[0]
  }));

  const optimized = optimizeRoute(stopsWithCoords, start);
  
  let totalDistance = 0;
  let totalDuration = 0;
  
  optimized.forEach(stop => {
    totalDistance += stop.distanceFromPrev;
    totalDuration += estimateTravelTime(stop.distanceFromPrev);
  });

  return {
    stops: optimized,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration
  };
};

export default { findBestDriver, createOptimizedRoute };
