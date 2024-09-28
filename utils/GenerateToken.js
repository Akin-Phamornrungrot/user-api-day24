require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.LOGIN_TOKEN_EXPIRATION,
  });
};
