import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import apiDocsRoutes from './routes/apiDocs.js';

const app = express();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // 1. Allow OSM Tiles and Cloudinary
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org"], 
      // 2. THE FIX: Add 'blob:' here
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "blob:"],
      // 3. Allow Background Workers (needed for maps)
      workerSrc: ["'self'", "blob:"],
      // 4. Allow the Location API and Sockets
      connectSrc: [
        "'self'", 
        "https://res.cloudinary.com", 
        "https://ipapi.co", 
        "ws://localhost:5000",
        "wss://*.onrender.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Created uploads directory');
}

// Serve static files from uploads/temp
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Cache images for 7 days
    res.setHeader('Cache-Control', 'public, max-age=604800');
  }
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api/v1/auth', generalLimiter);
app.use('/api/v1/bookings', generalLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// ========== ROUTES ==========

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'running',
    message: 'HostelHub API is operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Welcome page
// app.get('/', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: '🏠 Welcome to HostelHub API',
//     version: '1.0.0',
//     documentation: `${req.protocol}://${req.get('host')}/api-docs`,
//     health: `${req.protocol}://${req.get('host')}/health`,
//     api: {
//       base: `${req.protocol}://${req.get('host')}/api/v1`,
//       endpoints: {
//         auth: `${req.protocol}://${req.get('host')}/api/v1/auth`,
//         users: `${req.protocol}://${req.get('host')}/api/v1/users`,
//         hostels: `${req.protocol}://${req.get('host')}/api/v1/hostels`,
//         bookings: `${req.protocol}://${req.get('host')}/api/v1/bookings`,
//         reviews: `${req.protocol}://${req.get('host')}/api/v1/reviews`,
//         messages: `${req.protocol}://${req.get('host')}/api/v1/messages`,
//         analytics: `${req.protocol}://${req.get('host')}/api/v1/analytics`,
//         upload: `${req.protocol}://${req.get('host')}/api/v1/upload`
//       }
//     },
//     status: 'operational',
//     timestamp: new Date().toISOString()
//   });
// });

// API Documentation Page
app.get('/api-docs', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HostelHub API Documentation</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .header {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
      }
      .header h1 {
        margin: 0;
        font-size: 2.5rem;
      }
      .card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .endpoint {
        background: #f1f5f9;
        border-left: 4px solid #4f46e5;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 4px;
      }
      .method {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 0.9rem;
        margin-right: 10px;
        font-family: monospace;
      }
      .GET { background: #10b981; color: white; }
      .POST { background: #f59e0b; color: white; }
      .PUT { background: #3b82f6; color: white; }
      .DELETE { background: #ef4444; color: white; }
      .path {
        font-family: monospace;
        font-size: 1rem;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🏠 HostelHub API Documentation</h1>
      <p>Complete backend API for hostel booking platform</p>
    </div>
    
    <div class="card">
      <h2>📋 Quick Links</h2>
      <p><a href="/health">Health Check</a> • <a href="/api/v1">API Base</a></p>
    </div>
    
    <div class="card">
      <h2>🔐 Authentication Endpoints</h2>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/auth/register</span>
        <div>Register new user</div>
      </div>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/auth/login</span>
        <div>Login user</div>
      </div>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/auth/refresh-token</span>
        <div>Refresh access token</div>
      </div>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/auth/logout</span>
        <div>Logout user</div>
      </div>
    </div>
    
    <div class="card">
      <h2>🏠 Hostel Endpoints</h2>
      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/v1/hostels</span>
        <div>Get hostels with filters (geolocation supported)</div>
      </div>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/hostels</span>
        <div>Create hostel (owner/admin only)</div>
      </div>
      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/v1/hostels/:id</span>
        <div>Get specific hostel</div>
      </div>
    </div>
    
    <div class="card">
      <h2>📅 Booking Endpoints</h2>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/bookings/initiate</span>
        <div>Initiate booking (student only)</div>
      </div>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/bookings/verify</span>
        <div>Verify payment</div>
      </div>
      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/v1/bookings</span>
        <div>Get user bookings</div>
      </div>
    </div>
    
    <div class="card">
      <h2>💬 Message Endpoints</h2>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/messages</span>
        <div>Send message</div>
      </div>
      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/v1/messages/conversation/:userId</span>
        <div>Get conversation</div>
      </div>
    </div>
    
    <div class="card">
      <h2>📤 Upload Endpoints</h2>
      <div class="endpoint">
        <span class="method POST">POST</span>
        <span class="path">/api/v1/upload</span>
        <div>Upload images</div>
      </div>
      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/v1/upload/unsigned</span>
        <div>Get Cloudinary upload config</div>
      </div>
    </div>
    
    <div class="card">
      <h2>📊 Analytics Endpoints</h2>
      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/v1/analytics/overview</span>
        <div>Admin analytics (admin only)</div>
      </div>
      <div class="endpoint">
        <span class="method GET">GET</span>
        <span class="path">/api/v1/analytics/owner</span>
        <div>Owner analytics (owner only)</div>
      </div>
    </div>
    
    <div class="card">
      <h2>🔧 Testing Credentials (from seed)</h2>
      <p><strong>Admin:</strong> admin@hostelhub.com / admin123</p>
      <p><strong>Owner:</strong> owner1@hostelhub.com / owner123</p>
      <p><strong>Student:</strong> student1@hostelhub.com / student123</p>
    </div>
    
    <div class="card">
      <p><strong>Base URL:</strong> ${req.protocol}://${req.get('host')}</p>
      <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
      <p><strong>Server Uptime:</strong> ${process.uptime().toFixed(0)} seconds</p>
    </div>
  </body>
  </html>
  `);
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/hostels', hostelRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/webhook', webhookRoutes);
app.use('/api/v1/docs', apiDocsRoutes);

// ========== FRONTEND SERVING & TROUBLESHOOTING ==========

// 1. Serve static assets
// 2. HEALTH & DOCS
// app.get('/health', (req, res) => { ... });
// app.get('/api-docs', (req, res) => { ... });

// 3. THE STATIC FRONTEND (Move this to the very bottom)
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// 4. THE CATCH-ALL (This handles navigation for your frontend)
app.get('*', (req, res) => {
    // If someone calls a broken API link, don't send the website, send a 404
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API Route Not Found' });
    }
    // Send the index.html for everything else (the root / and frontend routes)
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Visit /api-docs for available endpoints'
  });
});

// Global error handler
app.use(errorHandler);

export default app;