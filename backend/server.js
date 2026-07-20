const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize DB setup
const db = require('./config/db');
const visitorController = require('./controllers/visitor.controller');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if in production (optional placeholder)
app.use(express.static(path.join(__dirname, 'public')));

// Public endpoints
app.get('/api/crowd-status', visitorController.getCrowdStatus);

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Temple Management System Backend Server Running`);
  console.log(` Port: ${PORT}`);
  console.log(` Database Mode: ${process.env.DB_MODE || 'local (SQLite)'}`);
  console.log(`===================================================`);
});
