const { query } = require('../db/pool');

//
// ================= GET ALL BOOKINGS =================
//
const findAll = async ({ status, vehicle_id } = {}) => {
  try {
    let sql = `
      SELECT 
        b.*, 
        v.name AS vehicle_name, 
        v.type AS vehicle_type, 
        v.plate_number
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE 1=1
    `;

    const params = [];

    // ✅ Filter by status (case-insensitive)
    if (status) {
      params.push(status);
      sql += ` AND LOWER(b.status) = LOWER($${params.length})`;
    }

    // ✅ Filter by vehicle
    if (vehicle_id) {
      params.push(vehicle_id);
      sql += ` AND b.vehicle_id = $${params.length}`;
    }

    // ✅ Always order latest first
    sql += ` ORDER BY b.created_at DESC`;

    const result = await query(sql, params);

    console.log('📦 DB BOOKINGS:', result.rows); // debug

    return result.rows;
  } catch (err) {
    console.error('❌ findAll error:', err);
    return [];
  }
};

//
// ================= COUNT BOOKINGS =================
//
const count = async ({ status, vehicle_id } = {}) => {
  try {
    let sql = `SELECT COUNT(*) FROM bookings WHERE 1=1`;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND LOWER(status) = LOWER($${params.length})`;
    }

    if (vehicle_id) {
      params.push(vehicle_id);
      sql += ` AND vehicle_id = $${params.length}`;
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count, 10);
  } catch (err) {
    console.error('❌ count error:', err);
    return 0;
  }
};

//
// ================= GET BY ID =================
//
const findById = async (id) => {
  try {
    const result = await query(
      `
      SELECT 
        b.*, 
        v.name AS vehicle_name, 
        v.type AS vehicle_type,
        v.plate_number, 
        v.capacity, 
        v.image_url
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = $1
      LIMIT 1
      `,
      [id]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error('❌ findById error:', err);
    return null;
  }
};

//
// ================= GET BY BOOKING REF =================
//
const findByRef = async (bookingRef) => {
  try {
    const result = await query(
      `SELECT * FROM bookings WHERE booking_ref = $1 LIMIT 1`,
      [bookingRef]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error('❌ findByRef error:', err);
    return null;
  }
};

//
// ================= CREATE BOOKING =================
//
const create = async ({
  booking_ref,
  customer_name,
  customer_phone,
  customer_email,
  vehicle_id,
  pickup_location,
  pickup_lat,
  pickup_lng,
  drop_location,
  drop_lat,
  drop_lng,
  distance_km,
  fare,
  scheduled_at,
  notes,
}) => {
  try {
    const result = await query(
      `
      INSERT INTO bookings (
        booking_ref,
        customer_name,
        customer_phone,
        customer_email,
        vehicle_id,
        pickup_location,
        pickup_lat,
        pickup_lng,
        drop_location,
        drop_lat,
        drop_lng,
        distance_km,
        fare,
        scheduled_at,
        notes,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
      RETURNING *
      `,
      [
        booking_ref,
        customer_name,
        customer_phone,
        customer_email || null,
        vehicle_id,
        pickup_location,
        pickup_lat || null,
        pickup_lng || null,
        drop_location,
        drop_lat || null,
        drop_lng || null,
        distance_km,
        fare,
        scheduled_at || null,
        notes || null,
        'pending', // ✅ DEFAULT STATUS
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error('❌ create error:', err);
    throw err;
  }
};

//
// ================= UPDATE STATUS =================
//
const updateStatus = async (id, status) => {
  try {
    const result = await query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error('❌ updateStatus error:', err);
    return null;
  }
};

//
// ================= EXPORT =================
//
module.exports = {
  findAll,
  count,
  findById,
  findByRef,
  create,
  updateStatus,
};