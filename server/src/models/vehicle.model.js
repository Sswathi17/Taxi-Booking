const { query } = require('../db/pool');

const findAll = async ({ type, status, limit = 50, offset = 0 } = {}) => {
  let sql = 'SELECT * FROM vehicles WHERE 1=1';
  const params = [];
  if (type)   { params.push(type);   sql += ` AND type = $${params.length}`; }
  if (status) { params.push(status); sql += ` AND status = $${params.length}`; }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);
  const result = await query(sql, params);
  return result.rows;
};

const count = async ({ type, status } = {}) => {
  let sql = 'SELECT COUNT(*) FROM vehicles WHERE 1=1';
  const params = [];
  if (type)   { params.push(type);   sql += ` AND type = $${params.length}`; }
  if (status) { params.push(status); sql += ` AND status = $${params.length}`; }
  const result = await query(sql, params);
  return parseInt(result.rows[0].count, 10);
};

const findById = async (id) => {
  const result = await query('SELECT * FROM vehicles WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
};

const findByPlate = async (plateNumber) => {
  const result = await query('SELECT * FROM vehicles WHERE plate_number = $1 LIMIT 1', [plateNumber]);
  return result.rows[0] || null;
};

const create = async ({ name, type, plate_number, capacity, base_fare, per_km_rate, image_url }) => {
  const result = await query(
    `INSERT INTO vehicles (name, type, plate_number, capacity, base_fare, per_km_rate, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, type, plate_number, capacity, base_fare, per_km_rate, image_url || null]
  );
  return result.rows[0];
};

const update = async (id, fields) => {
  const allowed = ['name', 'type', 'plate_number', 'capacity', 'base_fare', 'per_km_rate', 'status', 'image_url'];
  const setClauses = [];
  const params = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key) && value !== undefined) {
      params.push(value);
      setClauses.push(`${key} = $${params.length}`);
    }
  }
  if (setClauses.length === 0) return null;
  params.push(id);
  const result = await query(
    `UPDATE vehicles SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

module.exports = { findAll, count, findById, findByPlate, create, update, remove };