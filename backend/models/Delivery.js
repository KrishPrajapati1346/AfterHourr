import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
    default: 'assigned'
  },
  pickupTime: Date,
  deliveryTime: Date,
  distance: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  verificationCode: { type: String },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  },
  carbonSaved: { type: Number, default: 0 },
  mealsDelivered: { type: Number, default: 0 }
}, {
  timestamps: true
});

deliverySchema.index({ driver: 1, createdAt: -1 });
deliverySchema.index({ ngo: 1, createdAt: -1 });

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
