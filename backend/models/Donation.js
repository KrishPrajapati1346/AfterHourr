import mongoose from 'mongoose';

const donationItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['grains', 'vegetables', 'dairy', 'protein', 'prepared', 'bakery', 'beverages', 'fruits', 'other'],
    default: 'other'
  },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'servings' },
  shelfLife: { type: Number, default: 4 }, // hours
  perishability: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, { _id: false });

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [donationItemSchema],
  totalServings: {
    type: Number,
    default: 0
  },
  rawDescription: {
    type: String,
    trim: true
  },
  aiParsed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'pickup_assigned', 'arrived', 'in_transit', 'delivered', 'expired', 'cancelled'],
    default: 'pending'
  },
  pickupLocation: {
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
  pickupAddress: {
    type: String,
    trim: true
  },
  pickupWindow: {
    start: { type: Date, default: Date.now },
    end: { type: Date, default: () => new Date(Date.now() + 4 * 60 * 60 * 1000) }
  },
  matchedNGO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedValue: {
    type: Number,
    default: 0
  },
  carbonSaved: {
    type: Number,
    default: 0
  },
  claimedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

// Geospatial index
donationSchema.index({ pickupLocation: '2dsphere' });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ donor: 1, status: 1 });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
