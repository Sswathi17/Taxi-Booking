const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, config.bcrypt.saltRounds);
const comparePassword = async (plainPassword, hash) => bcrypt.compare(plainPassword, hash);

const signToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'taxi-booking-api',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret, { issuer: 'taxi-booking-api' });
};

module.exports = { hashPassword, comparePassword, signToken, verifyToken };