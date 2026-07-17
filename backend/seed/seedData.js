import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Direct imports
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Delivery from '../models/Delivery.js';
import Route from '../models/Route.js';
import Notification from '../models/Notification.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afterhour';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('⚡ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Donation.deleteMany({}),
      Delivery.deleteMany({}),
      Route.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    const password = await bcrypt.hash('password123', 12);

    // ---- DONORS ----
    const donors = await User.insertMany([
      { name: 'Raj Mehta', email: 'taj@demo.com', password, role: 'donor', organizationName: 'Taj Palace Kitchen', phone: '+91 98765 43210', address: 'Apollo Bunder, Colaba', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8347, 18.9217] }, isVerified: true },
      { name: 'Priya Shah', email: 'oberoi@demo.com', password, role: 'donor', organizationName: 'The Oberoi Mumbai', phone: '+91 98765 43211', address: 'Nariman Point', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8258, 18.9256] }, isVerified: true },
      { name: 'Amit Patel', email: 'marriott@demo.com', password, role: 'donor', organizationName: 'JW Marriott Juhu', phone: '+91 98765 43212', address: 'Juhu Tara Road', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8296, 19.0990] }, isVerified: true },
      { name: 'Neha Gupta', email: 'cloud9@demo.com', password, role: 'donor', organizationName: 'Cloud 9 Bistro', phone: '+91 98765 43213', address: 'Bandra West', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8362, 19.0596] }, isVerified: true },
      { name: 'Sanjay Kumar', email: 'spicelab@demo.com', password, role: 'donor', organizationName: 'Spice Lab BKC', phone: '+91 98765 43214', address: 'BKC, Bandra East', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8609, 19.0658] }, isVerified: true },
      { name: 'Anita Desai', email: 'leela@demo.com', password, role: 'donor', organizationName: 'The Leela Mumbai', phone: '+91 98765 43215', address: 'Andheri East', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8697, 19.1127] }, isVerified: true },
    ]);
    console.log(`✅ Created ${donors.length} donors`);

    // ---- NGOS ----
    const ngos = await User.insertMany([
      { name: 'Roti Foundation', email: 'roti@demo.com', password, role: 'ngo', organizationName: 'Roti Foundation', phone: '+91 98765 10001', address: 'Dharavi', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8553, 19.0420] }, capacity: 500, currentLoad: 120, isVerified: true },
      { name: 'Akshaya Patra', email: 'akshaya@demo.com', password, role: 'ngo', organizationName: 'Akshaya Patra Mumbai', phone: '+91 98765 10002', address: 'Borivali West', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8568, 19.2307] }, capacity: 1000, currentLoad: 350, isVerified: true },
      { name: 'Robin Hood Army', email: 'robinhood@demo.com', password, role: 'ngo', organizationName: 'Robin Hood Army', phone: '+91 98765 10003', address: 'Andheri West', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8365, 19.1367] }, capacity: 300, currentLoad: 80, isVerified: true },
      { name: 'Feeding India', email: 'feeding@demo.com', password, role: 'ngo', organizationName: 'Feeding India', phone: '+91 98765 10004', address: 'Worli', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8170, 19.0148] }, capacity: 400, currentLoad: 200, emergencyNeed: true, isVerified: true },
      { name: 'Anna Seva', email: 'annaseva@demo.com', password, role: 'ngo', organizationName: 'Anna Seva Trust', phone: '+91 98765 10005', address: 'Malad West', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8410, 19.1868] }, capacity: 250, currentLoad: 50, isVerified: true },
    ]);
    console.log(`✅ Created ${ngos.length} NGOs`);

    // ---- DRIVERS ----
    const drivers = await User.insertMany([
      { name: 'Vikram Singh', email: 'vikram@demo.com', password, role: 'driver', phone: '+91 98765 20001', address: 'Dadar', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8438, 19.0178] }, vehicleType: 'car', isOnline: true, completedDeliveries: 42, rating: 4.8, totalDistance: 380, isVerified: true },
      { name: 'Arjun Reddy', email: 'arjun@demo.com', password, role: 'driver', phone: '+91 98765 20002', address: 'Kurla', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8795, 19.0726] }, vehicleType: 'bike', isOnline: true, completedDeliveries: 28, rating: 4.6, totalDistance: 210, isVerified: true },
      { name: 'Meera Joshi', email: 'meera@demo.com', password, role: 'driver', phone: '+91 98765 20003', address: 'Bandra', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8350, 19.0544] }, vehicleType: 'van', isOnline: false, completedDeliveries: 67, rating: 4.9, totalDistance: 590, isVerified: true },
      { name: 'Suresh Nair', email: 'suresh@demo.com', password, role: 'driver', phone: '+91 98765 20004', address: 'Andheri', city: 'Mumbai', location: { type: 'Point', coordinates: [72.8486, 19.1197] }, vehicleType: 'car', isOnline: true, completedDeliveries: 15, rating: 4.5, totalDistance: 120, isVerified: true },
    ]);
    console.log(`✅ Created ${drivers.length} drivers`);

    // ---- DONATIONS (mix of statuses) ----
    const donationData = [];

    // Delivered donations (for analytics)
    for (let i = 0; i < 20; i++) {
      const donor = donors[Math.floor(Math.random() * donors.length)];
      const ngo = ngos[Math.floor(Math.random() * ngos.length)];
      const driver = drivers[Math.floor(Math.random() * drivers.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - daysAgo * 86400000);

      donationData.push({
        donor: donor._id,
        items: [
          { name: ['Rice', 'Biryani', 'Roti', 'Dal', 'Paneer Curry'][Math.floor(Math.random() * 5)], category: 'prepared', quantity: Math.floor(Math.random() * 40 + 10), unit: 'servings', shelfLife: 4, perishability: 'high' },
          { name: ['Naan', 'Salad', 'Mixed Veg', 'Raita'][Math.floor(Math.random() * 4)], category: ['bakery', 'vegetables', 'prepared', 'dairy'][Math.floor(Math.random() * 4)], quantity: Math.floor(Math.random() * 20 + 5), unit: 'servings', shelfLife: 3, perishability: 'medium' }
        ],
        totalServings: Math.floor(Math.random() * 60 + 15),
        rawDescription: 'Surplus food from dinner service',
        aiParsed: true,
        status: 'delivered',
        pickupLocation: donor.location,
        pickupAddress: donor.address,
        matchedNGO: ngo._id,
        assignedDriver: driver._id,
        estimatedValue: Math.floor(Math.random() * 100 + 30),
        carbonSaved: Math.round(Math.random() * 15 + 3),
        claimedAt: createdAt,
        pickedUpAt: new Date(createdAt.getTime() + 1800000),
        deliveredAt: new Date(createdAt.getTime() + 3600000),
        createdAt
      });
    }

    // Active donations
    const activeStatuses = ['pending', 'pending', 'matched', 'pickup_assigned', 'in_transit'];
    for (let i = 0; i < 8; i++) {
      const donor = donors[Math.floor(Math.random() * donors.length)];
      const status = activeStatuses[Math.floor(Math.random() * activeStatuses.length)];

      const d = {
        donor: donor._id,
        items: [
          { name: ['Butter Chicken', 'Fried Rice', 'Pasta', 'Soup', 'Sandwiches'][i % 5], category: 'prepared', quantity: Math.floor(Math.random() * 30 + 10), unit: 'servings', shelfLife: 3, perishability: ['high', 'critical', 'medium'][i % 3] }
        ],
        totalServings: Math.floor(Math.random() * 40 + 10),
        rawDescription: 'End of service surplus',
        aiParsed: true,
        status,
        pickupLocation: donor.location,
        pickupAddress: donor.address,
        estimatedValue: Math.floor(Math.random() * 80 + 20),
        carbonSaved: Math.round(Math.random() * 10 + 2),
      };

      if (status !== 'pending') {
        d.matchedNGO = ngos[Math.floor(Math.random() * ngos.length)]._id;
        d.claimedAt = new Date();
      }
      if (status === 'pickup_assigned' || status === 'in_transit') {
        d.assignedDriver = drivers[Math.floor(Math.random() * drivers.length)]._id;
      }

      donationData.push(d);
    }

    const donations = await Donation.insertMany(donationData);
    console.log(`✅ Created ${donations.length} donations`);

    // ---- DELIVERIES ----
    const deliveredDonations = donations.filter(d => d.status === 'delivered');
    const deliveryData = deliveredDonations.map(d => ({
      donation: d._id,
      driver: d.assignedDriver,
      donor: d.donor,
      ngo: d.matchedNGO,
      status: 'delivered',
      pickupTime: d.pickedUpAt,
      deliveryTime: d.deliveredAt,
      distance: Math.round(Math.random() * 15 + 2),
      duration: Math.floor(Math.random() * 30 + 10),
      carbonSaved: d.carbonSaved,
      mealsDelivered: d.totalServings,
      createdAt: d.createdAt
    }));

    const deliveries = await Delivery.insertMany(deliveryData);
    console.log(`✅ Created ${deliveries.length} delivery records`);

    console.log('\n🌃 Seed complete!');
    console.log('──────────────────────────────────');
    console.log('Demo accounts (password: password123):');
    console.log('  Donor:  taj@demo.com');
    console.log('  NGO:    roti@demo.com');
    console.log('  Driver: vikram@demo.com');
    console.log('──────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
