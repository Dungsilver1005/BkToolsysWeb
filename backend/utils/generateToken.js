const jwt = require("jsonwebtoken");

module.exports = (id) => {
  const payload = { id };
  const options = process.env.JWT_EXPIRE
    ? { expiresIn: process.env.JWT_EXPIRE }
    : {};

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};
