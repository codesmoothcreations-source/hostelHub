🏠 HostelHub API Documentation
📋 Table of Contents
Overview

Quick Start

Authentication

API Endpoints

Data Models

Error Handling

Examples

Testing

📖 Overview
HostelHub is a complete hostel booking platform backend API built with Node.js, Express, and MongoDB. The API supports user authentication, hostel listings with geolocation, bookings with payment integration, reviews, messaging, and analytics.

Base URL: http://localhost:5000/api/v1
API Version: 1.0.0
Documentation: http://localhost:5000/api-docs
Health Check: http://localhost:5000/health

🚀 Quick Start
1. Prerequisites
Node.js (v18 or higher)

MongoDB (local or Atlas)

Postman or similar API client

Frontend application (React, Vue, Angular, etc.)

2. Environment Setup
Create a .env file in the backend root with:

env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hostelhub
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=http://localhost:3000
3. Seed Database (Optional)
Populate with test data:

bash
npm run seed
Created users:

Admin: admin@hostelhub.com / admin123

Owner: owner1@hostelhub.com / owner123

Student: student1@hostelhub.com / student123

🔐 Authentication
The API uses JWT (JSON Web Tokens) for authentication. There are two types of tokens:

Access Token: Short-lived (15 minutes), used for API requests

Refresh Token: Long-lived (7 days), used to get new access tokens

Authentication Flow








Authentication Headers
javascript
// For protected endpoints
Authorization: Bearer <access_token>

// Example in fetch:
fetch('/api/v1/users/me', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  }
})
📚 API Endpoints
🔑 Authentication Endpoints
Register User
POST /auth/register

json
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student", // "student", "owner", or "admin"
  "phone": "+233123456789" // optional
}

// Response
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b2",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "avatar": "https://ui-avatars.com/api/..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
Login User
POST /auth/login

json
// Request Body
{
  "email": "john@example.com",
  "password": "password123"
}

// Response (same structure as register)
Refresh Access Token
POST /auth/refresh-token

json
// Request Body
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
Logout
POST /auth/logout

Requires authentication

Clears refresh token server-side

Client should clear stored tokens

👤 User Endpoints
Get Current User Profile
GET /users/me

Requires authentication

json
// Response
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "user": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b2",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "phone": "+233123456789",
      "avatar": "https://...",
      "location": {
        "type": "Point",
        "coordinates": [-0.1870, 5.6037],
        "address": "Accra, Ghana"
      }
    }
  }
}
Update Profile
PUT /users/me

Requires authentication

json
// Request Body
{
  "name": "John Updated",
  "phone": "+233987654321",
  "avatar": "https://cloudinary.com/image.jpg",
  "lat": 5.6037,      // Optional: Update location
  "lng": -0.1870,     // Optional: Update location
  "address": "New Address" // Optional
}

// Response
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      // Updated user object
    }
  }
}
Change Password
PUT /users/change-password

Requires authentication

json
// Request Body
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}

// Response
{
  "success": true,
  "message": "Password changed successfully"
}
🏠 Hostel Endpoints
Create Hostel
POST /hostels

Requires authentication + Owner/Admin role

json
// Request Body
{
  "name": "University Heights Hostel",
  "description": "Modern hostel near campus with excellent amenities",
  "price": 1200,
  "lat": 5.6037,                    // REQUIRED: From frontend geolocation
  "lng": -0.1870,                   // REQUIRED: From frontend geolocation
  "address": "123 University Avenue, Accra", // REQUIRED
  "availableRooms": 10,
  "amenities": ["WiFi", "AC", "Kitchen", "Laundry"],
  "rentDuration": "monthly",        // "monthly", "semester", or "yearly"
  "images": [                        // Optional
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ]
}

// Response
{
  "success": true,
  "message": "Hostel created successfully",
  "data": {
    "hostel": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b3",
      "name": "University Heights Hostel",
      "price": 1200,
      "currency": "GHS",
      "location": {
        "type": "Point",
        "coordinates": [-0.1870, 5.6037],
        "address": "123 University Avenue, Accra"
      },
      "availableRooms": 10,
      "status": "pending", // or "approved" if AUTO_APPROVE_HOSTELS=true
      // ... other fields
    }
  }
}
Get Hostels (with Geolocation Search)
GET /hostels

Requires authentication

Query Parameters:

javascript
// Basic pagination
/hostels?page=1&limit=10

// Price range
/hostels?minPrice=500&maxPrice=2000

// Amenities filter
/hostels?amenities=WiFi,AC,Kitchen

// Geolocation search (REQUIRES lat & lng)
/hostels?lat=5.6037&lng=-0.1870&radiusKm=5

// Sorting
/hostels?sort=-price      // Price high to low
/hostels?sort=price       // Price low to high
/hostels?sort=-rating     // Rating high to low
/hostels?sort=-createdAt  // Newest first

// Search by text
/hostels?search=university
Response with Geolocation:

json
{
  "success": true,
  "message": "Hostels retrieved",
  "data": {
    "hostels": [
      {
        "_id": "64f3b2c7a8b9c0d5e8f7a1b3",
        "name": "University Heights Hostel",
        "price": 1200,
        "location": {
          "coordinates": [-0.1870, 5.6037],
          "address": "123 University Avenue, Accra"
        },
        "distance": 1500, // meters (only with geolocation search)
        "rating": 4.5,
        "images": ["https://..."],
        "amenities": ["WiFi", "AC"],
        "availableRooms": 5,
        "owner": {
          "name": "Hostel Owner",
          "email": "owner@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
Get Single Hostel
GET /hostels/:id

Requires authentication

json
// Response
{
  "success": true,
  "message": "Hostel retrieved",
  "data": {
    "hostel": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b3",
      "name": "University Heights Hostel",
      "description": "...",
      "price": 1200,
      "location": { ... },
      "rating": 4.5,
      "numberOfRatings": 24,
      "availableRooms": 5,
      "initialRooms": 10,
      "occupancyRate": 50, // Virtual field
      "amenities": ["WiFi", "AC"],
      "images": ["https://..."],
      "owner": {
        "_id": "...",
        "name": "John Owner",
        "email": "owner@example.com",
        "phone": "+233..."
      },
      "reviews": [ // Optional: populate reviews
        {
          "rating": 5,
          "comment": "Great place!",
          "user": { "name": "Student One" }
        }
      ]
    }
  }
}
Update Hostel
PUT /hostels/:id

Requires authentication + Owner (own hostel) or Admin

json
// Request Body (same as create, all fields optional)
{
  "name": "Updated Hostel Name",
  "price": 1500,
  "availableRooms": 8
  // ... other fields
}
Delete Hostel
DELETE /hostels/:id

Requires authentication + Owner (own hostel) or Admin

json
// Response
{
  "success": true,
  "message": "Hostel deleted successfully"
}
📅 Booking Endpoints
Initiate Booking
POST /bookings/initiate

Requires authentication + Student role

json
// Request Body
{
  "hostelId": "64f3b2c7a8b9c0d5e8f7a1b3"
}

// Response
{
  "success": true,
  "message": "Booking initiated successfully",
  "data": {
    "booking": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b4",
      "hostel": "64f3b2c7a8b9c0d5e8f7a1b3",
      "student": "64f3b2c7a8b9c0d5e8f7a1b2",
      "amount": 1200,
      "currency": "GHS",
      "paymentStatus": "pending",
      "reference": "HHL-1691254567890-ABC123"
    },
    "paymentAuthorizationUrl": "https://paystack.com/pay/...",
    "paystackPublicKey": "pk_test_..." // For frontend Paystack integration
  }
}
Verify Booking Payment
POST /bookings/verify

Public endpoint (no authentication required)

json
// Request Body
{
  "reference": "HHL-1691254567890-ABC123"
}

// Response
{
  "success": true,
  "message": "Booking verified successfully",
  "data": {
    "booking": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b4",
      "paymentStatus": "success", // or "failed"
      "reference": "HHL-1691254567890-ABC123",
      "amount": 1200,
      "hostel": {
        "_id": "...",
        "name": "University Heights Hostel"
      },
      "student": {
        "_id": "...",
        "name": "John Student"
      }
    }
  }
}
Get User Bookings
GET /bookings

Requires authentication

Query Parameters:

javascript
/bookings?page=1&limit=10
Response varies by role:

Students: See their own bookings

Owners: See bookings for their hostels

Admins: See all bookings

json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "_id": "64f3b2c7a8b9c0d5e8f7a1b4",
        "amount": 1200,
        "currency": "GHS",
        "paymentStatus": "success",
        "reference": "HHL-1691254567890-ABC123",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "hostel": {
          "_id": "...",
          "name": "University Heights Hostel",
          "images": ["https://..."],
          "location": {
            "address": "123 University Avenue"
          }
        },
        "student": {
          "_id": "...",
          "name": "John Student",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
Get Booking Details
GET /bookings/:id

Requires authentication (owner of booking/hostel or admin)

Cancel Booking
PUT /bookings/:id/cancel

Requires authentication (owner of booking or hostel owner/admin)

⭐ Review Endpoints
Create Review
POST /reviews

Requires authentication + Student role (must have booked the hostel)

json
// Request Body
{
  "hostelId": "64f3b2c7a8b9c0d5e8f7a1b3",
  "rating": 5, // 1-5
  "comment": "Great hostel! Clean rooms and friendly staff."
}

// Response
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b5",
      "hostel": "64f3b2c7a8b9c0d5e8f7a1b3",
      "user": {
        "_id": "...",
        "name": "John Student",
        "avatar": "https://..."
      },
      "rating": 5,
      "comment": "Great hostel!...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
Get Hostel Reviews
GET /reviews/hostel/:hostelId

Requires authentication

json
// Response
{
  "success": true,
  "message": "Reviews retrieved",
  "data": {
    "reviews": [
      {
        "_id": "...",
        "rating": 5,
        "comment": "Great place!",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "user": {
          "name": "Student One",
          "avatar": "https://..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 24,
      "pages": 3
    }
  }
}
💬 Messaging Endpoints
Send Message
POST /messages

Requires authentication

json
// Request Body
{
  "to": "64f3b2c7a8b9c0d5e8f7a1b6", // Recipient user ID
  "content": "Hello, I'm interested in your hostel. Is it available?"
}

// Response
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "64f3b2c7a8b9c0d5e8f7a1b7",
      "from": {
        "_id": "...",
        "name": "Sender Name",
        "avatar": "https://..."
      },
      "to": {
        "_id": "...",
        "name": "Recipient Name",
        "avatar": "https://..."
      },
      "content": "Hello, I'm interested...",
      "read": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
Get Conversation
GET /messages/conversation/:userId

Requires authentication

javascript
// Query Parameters
/messages/conversation/64f3b2c7a8b9c0d5e8f7a1b6?page=1&limit=50
json
// Response
{
  "success": true,
  "message": "Conversation retrieved",
  "data": {
    "messages": [
      {
        "_id": "...",
        "from": { "name": "User A", "avatar": "..." },
        "to": { "name": "User B", "avatar": "..." },
        "content": "Hello!",
        "read": true,
        "createdAt": "..."
      }
    ],
    "count": 25
  }
}
Get Unread Count
GET /messages/unread

Requires authentication

json
// Response
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "count": 3
  }
}
Get Recent Conversations
GET /messages/conversations

Requires authentication

json
// Response
{
  "success": true,
  "message": "Recent conversations retrieved",
  "data": {
    "conversations": [
      {
        "user": {
          "_id": "...",
          "name": "John Doe",
          "avatar": "https://...",
          "role": "owner"
        },
        "lastMessage": "Hello, is the room available?",
        "lastMessageTime": "2024-01-15T10:30:00.000Z",
        "unreadCount": 2
      }
    ]
  }
}
📊 Analytics Endpoints
Get Admin Analytics
GET /analytics/overview

Requires authentication + Admin role

json
// Response
{
  "success": true,
  "message": "Analytics retrieved",
  "data": {
    "totals": {
      "users": 150,
      "owners": 25,
      "students": 125,
      "hostels": 50,
      "bookings": 300,
      "revenue": 360000
    },
    "charts": {
      "revenuePerDay": [
        { "_id": "2024-01-01", "revenue": 12000, "bookings": 10 },
        { "_id": "2024-01-02", "revenue": 15000, "bookings": 12 }
      ],
      "hostelStatus": [
        { "_id": "approved", "count": 40 },
        { "_id": "pending", "count": 8 },
        { "_id": "rejected", "count": 2 }
      ],
      "ratingDistribution": [
        { "_id": 5, "count": 100 },
        { "_id": 4, "count": 80 },
        { "_id": 3, "count": 40 }
      ]
    },
    "recentBookings": [...],
    "topHostels": [...]
  }
}
Get Owner Analytics
GET /analytics/owner

Requires authentication + Owner role

json
// Response
{
  "success": true,
  "message": "Analytics retrieved",
  "data": {
    "totals": {
      "hostels": 5,
      "bookings": 45,
      "revenue": 54000,
      "occupancyRate": 75
    },
    "charts": {
      "revenuePerDay": [...]
    },
    "hostelPerformance": [
      {
        "name": "Hostel A",
        "rating": 4.5,
        "availableRooms": 2,
        "initialRooms": 10,
        "totalBookings": 25,
        "totalRevenue": 30000
      }
    ],
    "recentBookings": [...]
  }
}
Get Dashboard Stats (All Roles)
GET /analytics/dashboard

Requires authentication

Students: Booking counts, recent bookings, favorite hostels

Owners: Same as /analytics/owner

Admins: Same as /analytics/overview

📤 Upload Endpoints
Upload Images
POST /upload

Requires authentication

javascript
// Form Data (multipart/form-data)
// Key: "images" (multiple files allowed)
// Max: 10 files, 5MB each
// Types: jpeg, jpg, png, webp, gif

// Response
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      "https://res.cloudinary.com/.../image1.jpg",
      "https://res.cloudinary.com/.../image2.jpg"
    ],
    "storage": "cloudinary" // or "local"
  }
}
Get Upload Configuration
GET /upload/unsigned

Requires authentication

json
// Response (for client-side Cloudinary upload)
{
  "success": true,
  "message": "Upload configuration retrieved",
  "data": {
    "cloudName": "your_cloud_name",
    "apiKey": "your_api_key",
    "uploadPreset": "hostelhub_unsigned",
    "folder": "hostelhub"
  }
}
📝 Data Models
User Model
javascript
{
  _id: ObjectId,
  name: String,           // required
  email: String,          // required, unique
  password: String,       // required, hashed
  role: String,          // "student", "owner", or "admin"
  phone: String,         // optional
  avatar: String,        // URL
  location: {
    type: "Point",
    coordinates: [lng, lat], // [-0.1870, 5.6037]
    address: String
  },
  refreshToken: String,  // JWT refresh token
  isActive: Boolean,     // default: true
  createdAt: Date,
  updatedAt: Date
}
Hostel Model
javascript
{
  _id: ObjectId,
  owner: ObjectId,       // reference to User
  name: String,          // required
  description: String,   // required
  price: Number,         // required, in GH₵
  currency: String,      // default: "GHS"
  rentDuration: String,  // "monthly", "semester", "yearly"
  images: [String],      // Cloudinary URLs
  amenities: [String],   // ["WiFi", "AC", "Kitchen"]
  location: {
    type: "Point",
    coordinates: [lng, lat], // REQUIRED from frontend geolocation
    address: String          // REQUIRED
  },
  availableRooms: Number, // required
  initialRooms: Number,   // required (same as initial availableRooms)
  rating: Number,         // average 0-5
  numberOfRatings: Number,
  status: String,         // "pending", "approved", "rejected"
  isActive: Boolean,      // default: true
  createdAt: Date,
  updatedAt: Date
}
Booking Model
javascript
{
  _id: ObjectId,
  hostel: ObjectId,      // reference to Hostel
  student: ObjectId,     // reference to User (student)
  amount: Number,        // in GH₵
  currency: String,      // "GHS"
  paymentStatus: String, // "pending", "processing", "success", "failed"
  reference: String,     // unique booking reference
  paystackReference: String, // Paystack transaction reference
  paymentMeta: Object,   // Payment gateway response
  duration: String,      // "monthly", "semester", "yearly"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Review Model
javascript
{
  _id: ObjectId,
  hostel: ObjectId,      // reference to Hostel
  user: ObjectId,        // reference to User
  rating: Number,        // 1-5
  comment: String,       // required
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Message Model
javascript
{
  _id: ObjectId,
  from: ObjectId,        // sender user ID
  to: ObjectId,          // recipient user ID
  content: String,       // message text
  read: Boolean,         // default: false
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
⚠️ Error Handling
Error Response Format
json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
Common HTTP Status Codes
200: Success

201: Created

400: Bad Request (validation errors)

401: Unauthorized (missing/invalid token)

403: Forbidden (insufficient permissions)

404: Not Found

409: Conflict (duplicate data)

422: Validation Error

429: Too Many Requests (rate limiting)

500: Internal Server Error

Validation Errors
json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
💡 Examples
Frontend Implementation Examples
1. Authentication Service (React)
javascript
// services/auth.js
const API_BASE = 'http://localhost:5000/api/v1';

export const authService = {
  async register(userData) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async login(credentials) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async refreshToken(refreshToken) {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return response.json();
  }
};
2. Hostel Service with Geolocation
javascript
// services/hostel.js
export const hostelService = {
  async getHostels(token, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/hostels?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async createHostel(token, hostelData) {
    // Get user's location first
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const dataWithLocation = {
      ...hostelData,
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    const response = await fetch(`${API_BASE}/hostels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataWithLocation)
    });
    return response.json();
  },

  async searchNearby(token, lat, lng, radiusKm = 5) {
    return this.getHostels(token, { lat, lng, radiusKm });
  }
};
3. Booking with Paystack Integration
javascript
// services/booking.js
export const bookingService = {
  async initiateBooking(token, hostelId) {
    const response = await fetch(`${API_BASE}/bookings/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ hostelId })
    });
    return response.json();
  },

  async handlePayment(paymentData) {
    // paymentData from bookingService.initiateBooking()
    const { paymentAuthorizationUrl, paystackPublicKey } = paymentData;
    
    // Initialize Paystack inline
    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: userEmail,
      amount: amountInPesewas,
      ref: reference,
      callback: function(response) {
        // Verify payment on backend
        this.verifyPayment(response.reference);
      },
      onClose: function() {
        alert('Payment window closed.');
      }
    });
    
    handler.openIframe();
  },

  async verifyPayment(reference) {
    const response = await fetch(`${API_BASE}/bookings/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference })
    });
    return response.json();
  }
};
4. Real-time Messaging (Socket.IO)
javascript
// services/socket.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  connect(token, userId) {
    this.userId = userId;
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket.emit('join', userId);
    });

    this.socket.on('new_message', (message) => {
      // Handle incoming message
      console.log('New message:', message);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  sendMessage(to, content) {
    if (!this.socket) return;
    
    this.socket.emit('send_message', {
      to,
      content,
      from: this.userId
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
🧪 Testing
Using Postman
Import the Postman collection from /HostelHub.postman_collection.json

Set environment variables:

base_url: http://localhost:5000

access_token: (auto-set after login)

Test Scripts
bash
# Run seed script
npm run seed

# Run with test data
npm run seed:destroy  # Clear and re-seed
Test Credentials
javascript
// From seed script
const testUsers = {
  admin: { email: 'admin@hostelhub.com', password: 'admin123' },
  owner: { email: 'owner1@hostelhub.com', password: 'owner123' },
  student: { email: 'student1@hostelhub.com', password: 'student123' }
};
Automated Testing (Example)
javascript
// Example test for hostel creation
describe('Hostel API', () => {
  let token;
  
  beforeAll(async () => {
    // Login as owner
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'owner1@hostelhub.com',
        password: 'owner123'
      })
    });
    const data = await loginRes.json();
    token = data.data.accessToken;
  });

  test('Create hostel', async () => {
    const response = await fetch(`${API_BASE}/hostels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Hostel',
        description: 'Test description',
        price: 1000,
        lat: 5.6037,
        lng: -0.1870,
        address: 'Test Address',
        availableRooms: 5,
        amenities: ['WiFi', 'AC']
      })
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.hostel.name).toBe('Test Hostel');
  });
});
🔧 Advanced Usage
Geolocation Implementation
javascript
// Frontend: Get user location
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

// Usage in hostel creation
const createHostel = async (hostelData) => {
  try {
    const location = await getUserLocation();
    const data = {
      ...hostelData,
      lat: location.lat,
      lng: location.lng
    };
    // Send to backend
  } catch (error) {
    // Handle error or use default location
    console.error('Location error:', error);
  }
};
File Upload Implementation
javascript
// Frontend: Upload images
const uploadImages = async (files, token) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type - browser will set it with boundary
    },
    body: formData
  });

  return response.json();
};

// Client-side Cloudinary upload (optional)
const uploadToCloudinary = async (file) => {
  const config = await fetch(`${API_BASE}/upload/unsigned`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json());

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.data.uploadPreset);
  formData.append('cloud_name', config.data.cloudName);
  formData.append('folder', config.data.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.data.cloudName}/upload`,
    { method: 'POST', body: formData }
  );

  return response.json();
};
WebSocket Implementation
javascript
// Real-time chat component
import { useEffect } from 'react';
import { socketService } from '../services/socket';

const ChatComponent = ({ userId, token }) => {
  useEffect(() => {
    // Connect to socket
    socketService.connect(token, userId);
    
    // Listen for messages
    const handleMessage = (message) => {
      console.log('Received message:', message);
      // Update UI
    };
    
    socketService.socket?.on('new_message', handleMessage);
    
    return () => {
      socketService.socket?.off('new_message', handleMessage);
      socketService.disconnect();
    };
  }, [userId, token]);

  const sendMessage = (to, content) => {
    socketService.sendMessage(to, content);
    
    // Also save to database via API
    fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, content })
    });
  };

  return (
    // Chat UI
  );
};
📱 Frontend Integration Checklist
1. Authentication Flow
Implement register page

Implement login page

Store tokens securely (httpOnly cookies or secure storage)

Implement token refresh logic

Handle logout (clear tokens)

2. User Management
User profile page

Profile edit functionality

Password change functionality

Role-based UI rendering

3. Hostel Management
Get user location permission

Hostel listing with filters

Hostel creation form (with geolocation)

Hostel detail page

Image upload for hostels

4. Booking System
Booking initiation flow

Paystack integration

Booking verification

Booking history

5. Reviews & Ratings
Review submission (after booking)

Review display on hostel pages

Rating calculation display

6. Messaging System
Real-time chat interface

Conversation listing

Unread message indicators

7. Analytics (Owner/Admin)
Dashboard with charts

Revenue statistics

Occupancy rates

🚨 Troubleshooting
Common Issues & Solutions
CORS Errors

javascript
// Ensure frontend URL is in .env
FRONTEND_URL=http://localhost:3000
Geolocation Errors

Ensure HTTPS in production

Request location permissions

Provide fallback for denied permissions

Token Expiry

Implement automatic token refresh

Store refresh token securely

Handle 401 errors gracefully

File Upload Issues

Check file size (max 5MB)

Check file types (images only)

Ensure Cloudinary is configured (or use local)

Payment Issues

Check Paystack configuration

Use test keys for development

Implement proper error handling

Debugging Tips
Check server logs for errors

Use Postman to test endpoints

Verify environment variables

Check MongoDB connection

Test with seed data first

📞 Support
Getting Help
Check the API documentation at /api-docs

Review this documentation

Check server logs for errors

Test with Postman collection

Reporting Issues
When reporting issues, include:

Endpoint being called

Request payload

Response received

Error messages

Steps to reproduce

🎯 Best Practices for Frontend
Error Handling

Always handle API errors

Show user-friendly messages

Implement retry logic for failed requests

Loading States

Show loading indicators

Implement skeleton screens

Handle empty states

Security

Never expose tokens in client-side code

Use HTTPS in production

Validate all user inputs

Performance

Implement pagination for lists

Cache frequent requests

Use lazy loading for images

UX

Provide clear feedback for user actions

Implement proper form validation

Use consistent error messages

📈 Production Checklist
Before deploying to production:

Backend
Set NODE_ENV=production

Use MongoDB Atlas or production database

Configure Cloudinary for image uploads

Set up Paystack live keys

Enable SSL/TLS

Set up proper logging

Configure rate limiting

Set up monitoring

Frontend
Update API base URL to production

Implement error tracking

Add analytics

Test on multiple devices

Optimize performance

Implement PWA features (optional)

🔗 Additional Resources
Express.js Documentation

MongoDB Documentation

JWT Introduction

Socket.IO Documentation

Cloudinary Documentation

Paystack Documentation

📄 License
This API is provided as-is for educational and development purposes. Commercial use may require additional licensing.