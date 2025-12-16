markdown
# HostelHub Backend

A production-ready backend for hostel booking platform built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT (access + refresh tokens)
- Role-based authorization (student, owner, admin)
- Hostel management with geospatial search
- Image uploads with Cloudinary
- Payment integration with Paystack
- Real-time messaging with Socket.IO
- Booking system with atomic transactions
- Analytics dashboard
- PDF receipt generation

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Cloudinary account
- Paystack account (for payments)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hostelhub-backend
Install dependencies:

bash
npm install
Configure environment variables:

bash
cp .env.example .env
# Edit .env with your actual values
Set up Cloudinary:

Create a Cloudinary account

Get your Cloud Name, API Key, and API Secret

Create an unsigned upload preset (optional but recommended)

Set up Paystack:

Create a Paystack account

Get your test/live secret and public keys

Configure webhook URL in Paystack dashboard

Running the Application
Development mode:

bash
npm run dev
Production mode:

bash
npm start
Database Seeding
To populate the database with sample data:

bash
npm run seed
To clear database and seed:

bash
npm run seed:destroy
API Documentation
Authentication
POST /api/v1/auth/register - Register new user

POST /api/v1/auth/login - Login user

POST /api/v1/auth/refresh-token - Refresh access token

POST /api/v1/auth/logout - Logout user

Users
GET /api/v1/users/me - Get current user profile

PUT /api/v1/users/me - Update profile

PUT /api/v1/users/change-password - Change password

Hostels
POST /api/v1/hostels - Create hostel (owner only)

GET /api/v1/hostels - List hostels with filters

GET /api/v1/hostels/:id - Get hostel details

PUT /api/v1/hostels/:id - Update hostel

DELETE /api/v1/hostels/:id - Delete hostel

PATCH /api/v1/hostels/:id/status - Update status (admin only)

Bookings
POST /api/v1/bookings/initiate - Initiate booking (student only)

POST /api/v1/bookings/verify - Verify payment

GET /api/v1/bookings - List bookings

Reviews
POST /api/v1/reviews - Create review (student only)

GET /api/v1/reviews/hostel/:hostelId - Get hostel reviews

Messages
POST /api/v1/messages - Send message

GET /api/v1/messages/conversation/:userId - Get conversation

GET /api/v1/messages/unread - Get unread count

PUT /api/v1/messages/:id/read - Mark as read

Uploads
POST /api/v1/upload - Upload images

POST /api/v1/upload/unsigned - Get upload config for direct upload

Analytics
GET /api/v1/analytics/overview - Admin analytics

GET /api/v1/analytics/owner - Owner analytics

Webhooks
POST /api/v1/webhook/paystack - Paystack webhook

Testing with Postman
Import the included HostelHub.postman_collection.json for pre-configured requests.

Important Notes
Location Handling
The frontend must provide location coordinates using navigator.geolocation. Example payload for creating a hostel:

json
{
  "name": "Sample Hostel",
  "description": "A nice hostel",
  "price": 500,
  "lat": 5.6037,
  "lng": -0.1870,
  "address": "123 University Avenue, Accra",
  "availableRooms": 10,
  "amenities": ["WiFi", "AC", "Kitchen"]
}
Currency Support
All monetary values are stored in GH₵ (Ghanaian Cedis)

Paystack may require conversion if your account doesn't support GHS

If Paystack doesn't support GHS, consider using Flutterwave or another gateway

Webhook Configuration
For local development, use ngrok:

bash
ngrok http 5000
Then set the webhook URL in Paystack dashboard to: https://your-ngrok-url.ngrok.io/api/v1/webhook/paystack

Security Considerations
Always use HTTPS in production

Keep environment variables secure

Regularly update dependencies

Implement proper rate limiting

Use Cloudinary signed uploads in production

Validate all input data

Deployment
Set NODE_ENV=production

Use a process manager like PM2

Configure MongoDB Atlas for production

Set up proper logging

Configure SSL certificates

Support
For issues and questions, please check the documentation or contact support.