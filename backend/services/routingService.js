import { optimizeRoute, haversine, estimateTravelTime } from '../utils/haversine.js';

/**
 * Build an optimized route from pickup to dropoff points
 */
export const buildRoute = (driverCoords, pickups, dropoffs) => {
  const driverStart = { lat: driverCoords[1], lng: driverCoords[0] };
  
  // First optimize pickup order
  const optimizedPickups = optimizeRoute(
    pickups.map(p => ({ ...p, lat: p.coordinates[1], lng: p.coordinates[0] })),
    driverStart
  );

  // Then optimize dropoff order starting from last pickup
  const lastPickup = optimizedPickups.length > 0
    ? { lat: optimizedPickups[optimizedPickups.length - 1].lat, lng: optimizedPickups[optimizedPickups.length - 1].lng }
    : driverStart;

  const optimizedDropoffs = optimizeRoute(
    dropoffs.map(d => ({ ...d, lat: d.coordinates[1], lng: d.coordinates[0] })),
    lastPickup
  );

  const allStops = [
    ...optimizedPickups.map(s => ({ ...s, type: 'pickup' })),
    ...optimizedDropoffs.map(s => ({ ...s, type: 'dropoff' }))
  ];

  const totalDistance = allStops.reduce((sum, s) => sum + (s.distanceFromPrev || 0), 0);
  const totalDuration = estimateTravelTime(totalDistance);

  return {
    stops: allStops,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration,
    optimizationScore: calculateOptimizationScore(allStops, totalDistance)
  };
};

const calculateOptimizationScore = (stops, totalDistance) => {
  if (stops.length <= 1) return 100;
  // Score based on how close to optimal the route is
  const avgDistPerStop = totalDistance / stops.length;
  const score = Math.max(0, 100 - avgDistPerStop * 10);
  return Math.round(score);
};

export default { buildRoute };
