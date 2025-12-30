import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../backend/models/User.js';
import Hostel from '../backend/models/Hostel.js';
import Booking from '../backend/models/Booking.js';
import Review from '../backend/models/Review.js';
import Message from '../backend/models/Message.js';
import logger from '../backend/utils/logger.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@hostelhub.com',
    password: 'admin123',
    role: 'admin',
    phone: '+233123456789'
  },
  {
    name: 'Hostel Owner 1',
    email: 'owner1@hostelhub.com',
    password: 'owner123',
    role: 'owner',
    phone: '+233234567890'
  },
  {
    name: 'Hostel Owner 2',
    email: 'owner2@hostelhub.com',
    password: 'owner123',
    role: 'owner',
    phone: '+233345678901'
  },
  {
    name: 'Student 1',
    email: 'student1@hostelhub.com',
    password: 'student123',
    role: 'student',
    phone: '+233456789012'
  },
  {
    name: 'Student 2',
    email: 'student2@hostelhub.com',
    password: 'student123',
    role: 'student',
    phone: '+233567890123'
  }
];

const sampleHostels = [
  {
    name: "University Heights Hostel",
    description: "Modern hostel located near the university campus with excellent amenities.",
    price: 1200,
    lat: 5.6037,
    lng: -0.1870,
    address: "123 University Avenue, Accra",
    availableRooms: 15,
    amenities: ["WiFi", "AC", "Kitchen", "Laundry", "Study Room", "Gym"],
    rentDuration: "monthly",
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    status: "approved"
  },
  {
    name: "Green Valley Hostel",
    description: "Eco-friendly hostel in a peaceful neighborhood with garden view.",
    price: 950,
    lat: 5.6100,
    lng: -0.1950,
    address: "456 Green Street, Accra",
    availableRooms: 10,
    amenities: ["WiFi", "Garden", "Kitchen", "Parking", "Security"],
    rentDuration: "monthly",
    images: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    status: "approved"
  },
  {
    name: "City Center Hostel",
    description: "Central location with easy access to public transportation and shopping.",
    price: 1500,
    lat: 5.5950,
    lng: -0.1750,
    address: "789 Central Road, Accra",
    availableRooms: 8,
    amenities: ["WiFi", "AC", "TV", "Kitchen", "Laundry", "24/7 Security"],
    rentDuration: "semester",
    images: [
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    status: "approved"
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostelhub');
    logger.info('Connected to database for seeding');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Hostel.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    
    logger.info('Database cleared');
  } catch (error) {
    logger.error('Error clearing database:', error);
  }
};

const seedUsers = async () => {
  const createdUsers = [];
  
  for (const userData of sampleUsers) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
    });
    
    createdUsers.push(user);
    logger.info(`Created user: ${user.email} (${user.role})`);
  }
  
  return createdUsers;
};

const seedHostels = async (owners) => {
  const createdHostels = [];
  
  for (let i = 0; i < sampleHostels.length; i++) {
    const hostelData = sampleHostels[i];
    const owner = owners[i % owners.length]; // Distribute hostels among owners
    
    const hostel = await Hostel.create({
      ...hostelData,
      owner: owner._id,
      location: {
        type: 'Point',
        coordinates: [hostelData.lng, hostelData.lat],
        address: hostelData.address
      },
      initialRooms: hostelData.availableRooms
    });
    
    createdHostels.push(hostel);
    logger.info(`Created hostel: ${hostel.name} owned by ${owner.email}`);
  }
  
  return createdHostels;
};

const seedBookings = async (students, hostels) => {
  const createdBookings = [];
  
  // Create bookings for each student
  for (const student of students) {
    const hostel = hostels[Math.floor(Math.random() * hostels.length)];
    
    const booking = await Booking.create({
      hostel: hostel._id,
      student: student._id,
      amount: hostel.price,
      currency: 'GHS',
      paymentStatus: 'success',
      reference: `HHL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      duration: hostel.rentDuration
    });
    
    createdBookings.push(booking);
    logger.info(`Created booking: ${booking.reference} for ${student.email}`);
    
    // Decrease available rooms
    hostel.availableRooms -= 1;
    await hostel.save();
  }
  
  return createdBookings;
};

const seedReviews = async (students, hostels) => {
  const createdReviews = [];
  
  // Create reviews for hostels
  for (const hostel of hostels) {
    for (const student of students) {
      // 50% chance to create a review
      if (Math.random() > 0.5) {
        const review = await Review.create({
          hostel: hostel._id,
          user: student._id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: `Great experience at ${hostel.name}. Highly recommended!`
        });
        
        createdReviews.push(review);
        logger.info(`Created review for ${hostel.name} by ${student.email}`);
      }
    }
  }
  
  return createdReviews;
};

const seedMessages = async (users) => {
  const createdMessages = [];
  
  // Create some sample messages
  for (let i = 0; i < 5; i++) {
    const from = users[Math.floor(Math.random() * users.length)];
    const to = users[Math.floor(Math.random() * users.length)];
    
    // Don't send message to self
    if (from._id.toString() !== to._id.toString()) {
      const message = await Message.create({
        from: from._id,
        to: to._id,
        content: `Hello ${to.name}! This is a sample message from ${from.name}.`,
        read: Math.random() > 0.5
      });
      
      createdMessages.push(message);
      logger.info(`Created message from ${from.email} to ${to.email}`);
    }
  }
  
  return createdMessages;
};

const main = async () => {
  try {
    await connectDB();
    
    // Check for --destroy flag
    const shouldClear = process.argv.includes('--destroy');
    if (shouldClear) {
      await clearDatabase();
    }
    
    logger.info('Starting database seeding...');
    
    // Seed users
    const users = await seedUsers();
    const admins = users.filter(u => u.role === 'admin');
    const owners = users.filter(u => u.role === 'owner');
    const students = users.filter(u => u.role === 'student');
    
    // Seed hostels
    const hostels = await seedHostels(owners);
    
    // Seed bookings
    const bookings = await seedBookings(students, hostels);
    
    // Seed reviews
    const reviews = await seedReviews(students, hostels);
    
    // Seed messages
    const messages = await seedMessages(users);
    
    // Update hostel ratings
    for (const hostel of hostels) {
      await hostel.updateRating(hostel._id);
    }
    
    logger.info('Seeding completed successfully!');
    logger.info(`Created: ${users.length} users, ${hostels.length} hostels, ${bookings.length} bookings, ${reviews.length} reviews, ${messages.length} messages`);
    
    // Display sample credentials
    console.log('\n=== SAMPLE CREDENTIALS ===');
    console.log('Admin: admin@hostelhub.com / admin123');
    console.log('Owner: owner1@hostelhub.com / owner123');
    console.log('Student: student1@hostelhub.com / student123');
    console.log('\nServer URL: http://localhost:5000');
    console.log('API Base: http://localhost:5000/api/v1');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seed
main();