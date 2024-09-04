import * as satellite from 'satellite.js';

export function calculateSatellitePosition(tleLine1, tleLine2) {
  if (!tleLine1 || !tleLine2) {
    console.log('Invalid TLE data');
    return null;
  }

  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    const date = new Date();
    const positionAndVelocity = satellite.propagate(satrec, date);
    const gmst = satellite.gstime(date);
    const position = satellite.eciToGeodetic(
      positionAndVelocity.position,
      gmst
    );

    return {
      latitude: satellite.degreesLat(position.latitude),
      longitude: satellite.degreesLong(position.longitude),
      altitude: position.height,
      velocityKmS: Math.sqrt(
        Math.pow(positionAndVelocity.velocity.x, 2) +
          Math.pow(positionAndVelocity.velocity.y, 2) +
          Math.pow(positionAndVelocity.velocity.z, 2)
      ),
    };
  } catch (error) {
    console.error('Error in calculateSatellitePosition:', error);
  }
}
