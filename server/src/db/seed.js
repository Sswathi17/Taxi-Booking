require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, query } = require('./pool');

const seed = async () => {
  try {
    console.log('🌱 Seeding database...');

    const existingAdmin = await query('SELECT id FROM admins WHERE email = $1', ['admin@taxi.com']);
    if (existingAdmin.rowCount > 0) {
      await query('DELETE FROM admins WHERE email = $1', ['admin@taxi.com']);
      console.log('🗑️  Removed existing admin account');
    }
    
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await query(
      `INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)`,
      ['Super Admin', 'admin@taxi.com', hashedPassword]
    );
    console.log('✅ Admin created → admin@taxi.com / Admin@123');

    const vehicles = [
      { name: 'Toyota Camry',  type: 'sedan',     plate: 'MH01AB1234', capacity: 4, base_fare: 50,  per_km: 12 },
      { name: 'Mahindra XUV',  type: 'suv',       plate: 'MH02CD5678', capacity: 6, base_fare: 80,  per_km: 18 },
      { name: 'Maruti Swift',  type: 'hatchback',  plate: 'MH03EF9012', capacity: 4, base_fare: 40,  per_km: 10 },
      { name: 'Mercedes E200', type: 'luxury',     plate: 'MH04GH3456', capacity: 4, base_fare: 200, per_km: 35 },
      { name: 'Bajaj Auto',    type: 'auto',       plate: 'MH05IJ7890', capacity: 3, base_fare: 25,  per_km: 8  },
    ];

    for (const v of vehicles) {
      const exists = await query('SELECT id FROM vehicles WHERE plate_number = $1', [v.plate]);
      if (exists.rowCount === 0) {
        await query(
          `INSERT INTO vehicles (name, type, plate_number, capacity, base_fare, per_km_rate)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [v.name, v.type, v.plate, v.capacity, v.base_fare, v.per_km]
        );
        console.log(`✅ Vehicle seeded: ${v.name}`);
      }
    }

    // Seed sample bookings
    const vehicleRows = await query('SELECT id FROM vehicles LIMIT 5');
    const vehicleIds = vehicleRows.rows.map(v => v.id);
    
    if (vehicleIds.length >= 5) {
      const bookings = [
        {
          booking_ref: 'BK001',
          customer_name: 'John Doe',
          customer_phone: '9876543210',
          customer_email: 'john@example.com',
          vehicle_id: vehicleIds[0],
          pickup_location: 'Mumbai Central',
          drop_location: 'Bandra Station',
          distance_km: 12,
          fare: 250,
          status: 'confirmed'
        },
        {
          booking_ref: 'BK002',
          customer_name: 'Sarah Khan',
          customer_phone: '9123456789',
          customer_email: 'sarah@example.com',
          vehicle_id: vehicleIds[1],
          pickup_location: 'Fort',
          drop_location: 'Gateway of India',
          distance_km: 5,
          fare: 180,
          status: 'confirmed'
        },
        {
          booking_ref: 'BK003',
          customer_name: 'Raj Patel',
          customer_phone: '9988776655',
          customer_email: 'raj@example.com',
          vehicle_id: vehicleIds[2],
          pickup_location: 'Andheri',
          drop_location: 'Powai',
          distance_km: 8,
          fare: 140,
          status: 'pending'
        },
        {
          booking_ref: 'BK004',
          customer_name: 'Priya Sharma',
          customer_phone: '9654321098',
          customer_email: 'priya@example.com',
          vehicle_id: vehicleIds[3],
          pickup_location: 'Colaba',
          drop_location: 'South Mumbai',
          distance_km: 3,
          fare: 120,
          status: 'confirmed'
        },
        {
          booking_ref: 'BK005',
          customer_name: 'Ahmed Hassan',
          customer_phone: '9111223344',
          customer_email: 'ahmed@example.com',
          vehicle_id: vehicleIds[4],
          pickup_location: 'Airport',
          drop_location: 'Downtown',
          distance_km: 35,
          fare: 1400,
          status: 'cancelled'
        }
      ];

      for (const b of bookings) {
        const exists = await query('SELECT id FROM bookings WHERE booking_ref = $1', [b.booking_ref]);
        if (exists.rowCount === 0) {
          await query(
            `INSERT INTO bookings (booking_ref, customer_name, customer_phone, customer_email, 
             vehicle_id, pickup_location, drop_location, distance_km, fare, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [b.booking_ref, b.customer_name, b.customer_phone, b.customer_email, 
             b.vehicle_id, b.pickup_location, b.drop_location, b.distance_km, b.fare, b.status]
          );
          console.log(`✅ Booking seeded: ${b.booking_ref} (${b.status})`);
        }
      }
    }

    console.log('🎉 Seeding completed.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
};

seed().catch((err) => { console.error(err); process.exit(1); });