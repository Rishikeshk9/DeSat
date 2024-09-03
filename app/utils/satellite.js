import * as satellite from 'satellite.js';

export function calculateSatellitePosition(tleLine1, tleLine2) {
  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  const now = new Date();

  const positionAndVelocity = satellite.propagate(satrec, now);

  const positionEci = positionAndVelocity.position;
  const velocityEci = positionAndVelocity.velocity;

  if (!positionEci || !velocityEci) {
    return {
      error: 'Unable to calculate position and velocity',
    };
  }

  const gmst = satellite.gstime(now);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  const longitude = satellite.degreesLong(positionGd.longitude);
  const latitude = satellite.degreesLat(positionGd.latitude);
  const altitude = positionGd.height;

  const velocityKmS = Math.sqrt(
    velocityEci.x * velocityEci.x +
      velocityEci.y * velocityEci.y +
      velocityEci.z * velocityEci.z
  );

  return {
    longitude,
    latitude,
    altitude,
    velocityKmS,
  };
}
