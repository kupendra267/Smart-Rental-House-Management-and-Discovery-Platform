require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allow Leaflet map tiles and external images
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Permissive for production deployment
  },
  credentials: true
}));

// Request logging & Body parsing
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'smart-rental-backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root API Index
app.get('/api', (req, res) => {
  res.json({
    message: 'Smart Rental House Management & Discovery Platform API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      favorites: '/api/favorites',
      applications: '/api/applications',
      rentals: '/api/rentals',
      invoices: '/api/rentals/invoices',
      payments: '/api/payments',
      maintenance: '/api/maintenance',
      reviews: '/api/reviews',
      complaints: '/api/complaints',
      notifications: '/api/notifications',
      recommendations: '/api/recommendations',
      admin: '/api/admin'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Locate frontend production build across possible deployment directories
const candidateDistDirs = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'backend/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(__dirname, '../../dist')
];

let foundDistDir = null;
for (const dir of candidateDistDirs) {
  if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
    foundDistDir = dir;
    break;
  }
}

if (foundDistDir) {
  console.log(`[Frontend]: Serving static production build from ${foundDistDir}`);
  app.use(express.static(foundDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(foundDistDir, 'index.html'));
  });
} else {
  // If deployed as standalone API service, render interactive API portal at root
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart Rental API Gateway</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6 font-sans">
        <div class="max-w-xl w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">SR</div>
            <div>
              <h1 class="text-xl font-bold">Smart Rental API Server</h1>
              <p class="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Service is Active & Healthy
              </p>
            </div>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed">
            The REST API gateway and database services are operational. You can query endpoints or connect the frontend client.
          </p>
          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            <a href="/api" class="p-3 bg-slate-900 rounded-xl border border-slate-700 text-blue-400 hover:border-blue-500 transition block">
              /api &rarr; Root Index
            </a>
            <a href="/health" class="p-3 bg-slate-900 rounded-xl border border-slate-700 text-emerald-400 hover:border-emerald-500 transition block">
              /health &rarr; Health Check
            </a>
            <a href="/api/properties" class="p-3 bg-slate-900 rounded-xl border border-slate-700 text-purple-400 hover:border-purple-500 transition block">
              /api/properties
            </a>
            <a href="/api/admin/analytics" class="p-3 bg-slate-900 rounded-xl border border-slate-700 text-amber-400 hover:border-amber-500 transition block">
              /api/admin/analytics
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  // 404 Handler for API routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      errorCode: 'NOT_FOUND'
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errorCode: err.errorCode || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
