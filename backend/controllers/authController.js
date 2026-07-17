import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sanitizeUser } from '../utils/validators.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organizationName, address, city, location, vehicleType, capacity } = req.body;

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userData = {
      name,
      email,
      password,
      role: role || 'donor',
      phone,
      organizationName,
      address,
      city: city || 'Mumbai'
    };

    if (location && location.coordinates) {
      userData.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    }

    // Role-specific fields
    if (role === 'driver' && vehicleType) {
      userData.vehicleType = vehicleType;
    }
    if (role === 'ngo' && capacity) {
      userData.capacity = capacity;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'address', 'city', 'organizationName', 'avatar', 'vehicleType', 'capacity'];
    const updates = {};
    
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (req.body.location && req.body.location.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with Google
// @route   POST /api/auth/google/login
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register with Google
// @route   POST /api/auth/google/register
export const googleRegister = async (req, res, next) => {
  try {
    const { credential, role, phone, organizationName, address, city, location, vehicleType, capacity } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please log in.' });
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');

    const userData = {
      name,
      email,
      password: randomPassword,
      role: role || 'donor',
      phone,
      organizationName,
      address,
      city: city || 'Mumbai',
      avatar: picture
    };

    if (location && location.lat && location.lng) {
      userData.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
    }

    if (role === 'ngo') {
      userData.capacity = capacity || 0;
    }
    if (role === 'driver') {
      userData.vehicleType = vehicleType || '';
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};
