export const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return false;
  const [lng, lat] = coordinates;
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};
