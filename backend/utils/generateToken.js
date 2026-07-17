import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

export default generateToken;
