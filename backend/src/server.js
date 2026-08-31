require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/properties'),
  path.join(__dirname, '../uploads/documents'),
  path.join(__dirname, '../uploads/receipts')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Smart Rental API Server running on port ${PORT}`);
  console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections & graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
