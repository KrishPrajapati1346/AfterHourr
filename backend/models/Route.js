import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pickup', 'dropoff'],
    required: true
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
  address: String,
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  contact: String,
  estimatedArrival: Date,
  actualArrival: Date,
  status: {
    type: String,
    enum: ['pending', 'arrived', 'completed'],
    default: 'pending'
  }
}, { _id: true });

const routeSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }],
  stops: [stopSchema],
  totalDistance: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned'
  },
  optimizationScore: {
    type: Number,
    default: 0
  },
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

routeSchema.index({ driver: 1, status: 1 });

const Route = mongoose.model('Route', routeSchema);
export default Route;
