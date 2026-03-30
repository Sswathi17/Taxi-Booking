const MINIMUM_FARE = 30;

const isNightTime = (dateTime) => {
  const hour = new Date(dateTime).getHours();
  return hour >= 22 || hour < 6;
};

const calculateFare = ({ distanceKm, baseFare, perKmRate, scheduledAt = new Date() }) => {
  if (distanceKm <= 0) throw new Error('Distance must be greater than 0');

  const distance = parseFloat(distanceKm);
  const base = parseFloat(baseFare);
  const perKm = parseFloat(perKmRate);
  let fare = base + distance * perKm;

  const breakdown = {
    base_fare: base,
    distance_km: distance,
    per_km_rate: perKm,
    distance_charge: parseFloat((distance * perKm).toFixed(2)),
    night_surcharge: 0,
    long_distance_surcharge: 0,
    subtotal: parseFloat(fare.toFixed(2)),
  };

  if (isNightTime(scheduledAt)) {
    const surcharge = fare * 0.2;
    breakdown.night_surcharge = parseFloat(surcharge.toFixed(2));
    fare += surcharge;
  }

  if (distance > 50) {
    const surcharge = fare * 0.1;
    breakdown.long_distance_surcharge = parseFloat(surcharge.toFixed(2));
    fare += surcharge;
  }

  if (fare < MINIMUM_FARE) fare = MINIMUM_FARE;
  breakdown.total_fare = parseFloat(fare.toFixed(2));

  return { fare: breakdown.total_fare, breakdown };
};

const VEHICLE_TYPE_RATES = {
  auto:      { base_fare: 25,  per_km_rate: 8  },
  bike:      { base_fare: 20,  per_km_rate: 6  },
  hatchback: { base_fare: 40,  per_km_rate: 10 },
  sedan:     { base_fare: 50,  per_km_rate: 12 },
  suv:       { base_fare: 80,  per_km_rate: 18 },
  luxury:    { base_fare: 200, per_km_rate: 35 },
};

const estimateByType = (distanceKm, scheduledAt = new Date()) => {
  const estimates = {};
  for (const [type, rates] of Object.entries(VEHICLE_TYPE_RATES)) {
    const result = calculateFare({
      distanceKm, baseFare: rates.base_fare, perKmRate: rates.per_km_rate, scheduledAt,
    });
    estimates[type] = result.fare;
  }
  return estimates;
};

module.exports = { calculateFare, estimateByType, VEHICLE_TYPE_RATES };