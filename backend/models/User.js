import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['donor', 'ngo', 'driver', 'admin'],
    required: [true, 'Role is required']
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  organizationName: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    default: 'Mumbai'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // NGO-specific fields
  capacity: {
    type: Number,
    default: 0
  },
  currentLoad: {
    type: Number,
    default: 0
  },
  emergencyNeed: {
    type: Boolean,
    default: false
  },
  // Driver-specific fields
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'van', 'truck', ''],
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalDistance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Geospatial index
userSchema.index({ location: '2dsphere' });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
