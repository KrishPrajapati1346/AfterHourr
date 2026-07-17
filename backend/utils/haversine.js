/**
 * Haversine formula — calculates distance between two lat/lng points
 * @returns distance in kilometers
 */
export const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Estimate travel time based on distance
 * @returns estimated minutes
 */
export const estimateTravelTime = (distanceKm, avgSpeedKmh = 30) => {
  return Math.round((distanceKm / avgSpeedKmh) * 60);
};

/**
 * Sort locations by nearest-neighbor heuristic
 * @param {Array} locations - Array of { lat, lng, ...rest }
 * @param {Object} start - Starting point { lat, lng }
 * @returns Optimized order of locations
 */
export const optimizeRoute = (locations, start) => {
  if (!locations.length) return [];
  
  const unvisited = [...locations];
  const route = [];
  let current = start;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversine(
        current.lat, current.lng,
        unvisited[i].lat, unvisited[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = unvisited.splice(nearestIdx, 1)[0];
    route.push({ ...nearest, distanceFromPrev: nearestDist });
    current = { lat: nearest.lat, lng: nearest.lng };
  }

  return route;
};

/**
 * Calculate perishability priority score
 * Higher score = more urgent
 */
export const perishabilityScore = (perishability, hoursRemaining) => {
  const baseScores = { critical: 100, high: 75, medium: 50, low: 25 };
  const base = baseScores[perishability] || 50;
  const urgencyMultiplier = Math.max(0, 1 - (hoursRemaining / 8));
  return Math.round(base * (1 + urgencyMultiplier));
};

export default { haversine, estimateTravelTime, optimizeRoute, perishabilityScore };
