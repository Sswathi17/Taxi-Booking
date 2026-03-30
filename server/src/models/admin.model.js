const { query } = require('../db/pool');

const findByEmail = async (email) => {
  const result = await query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await query('SELECT id, name, email, created_at FROM admins WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
};

const create = async ({ name, email, password }) => {
  const result = await query(
    `INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
    [name, email.toLowerCase().trim(), password]
  );
  return result.rows[0];
};

module.exports = { findByEmail, findById, create };