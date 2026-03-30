require('dotenv').config();
const { pool } = require('./pool');

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Running database migrations...');
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) NOT NULL UNIQUE,
        password   TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name         VARCHAR(100) NOT NULL,
        type         VARCHAR(50) NOT NULL CHECK (type IN ('sedan','suv','hatchback','luxury','auto','bike')),
        plate_number VARCHAR(20) NOT NULL UNIQUE,
        capacity     INTEGER NOT NULL DEFAULT 4,
        base_fare    NUMERIC(10,2) NOT NULL DEFAULT 0,
        per_km_rate  NUMERIC(10,2) NOT NULL DEFAULT 0,
        status       VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','booked','maintenance')),
        image_url    TEXT,
        created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_ref      VARCHAR(20) NOT NULL UNIQUE,
        customer_name    VARCHAR(100) NOT NULL,
        customer_phone   VARCHAR(20) NOT NULL,
        customer_email   VARCHAR(150),
        vehicle_id       UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
        pickup_location  TEXT NOT NULL,
        pickup_lat       NUMERIC(10,7),
        pickup_lng       NUMERIC(10,7),
        drop_location    TEXT NOT NULL,
        drop_lat         NUMERIC(10,7),
        drop_lng         NUMERIC(10,7),
        distance_km      NUMERIC(10,2) NOT NULL DEFAULT 0,
        fare             NUMERIC(10,2) NOT NULL DEFAULT 0,
        status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
        scheduled_at     TIMESTAMP WITH TIME ZONE,
        notes            TEXT,
        created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);`);

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ language 'plpgsql';
    `);

    for (const table of ['admins', 'vehicles', 'bookings']) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    await client.query('COMMIT');
    console.log('✅ All migrations completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch((err) => { console.error(err); process.exit(1); });