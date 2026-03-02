// backend/Server.js - Updated with better error handling
const express = require('express');
const cors = require('cors');
const path = require('path');
const contactRoutes = require('./routes/contact');
const termsRoutes = require('./routes/terms');
const claudeRoutes = require('./routes/claude');




const app = express();
const PORT = process.env.PORT || 5173;

// ===== MIDDLEWARE =====

// Enable CORS for frontend - MORE PERMISSIVE FOR DEVELOPMENT
app.use(cors({
    origin: ['http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type']
}));

// Parse JSON bodies - MUST come before routes
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// ===== STATIC FILES =====

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinScope AI Backend is running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Contact form routes
app.use('/api', contactRoutes);

// Terms & Conditions routes
app.use('/api', termsRoutes);

// 404 handler - for routes that don't exist
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.path);
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler - catches all errors
app.use((err, req, res, next) => {
    console.error('=== Global Error Handler ===');
    console.error('Error:', err);
    console.error('Stack:', err.stack);

    // Ensure we always send JSON
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ===== START SERVER =====

app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 FinScope AI Backend Server');
    console.log('=================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/send-contact-email`);
    console.log(`📄 Terms Download: http://localhost:${PORT}/api/download-terms`);
    console.log(`📖 Terms View: http://localhost:${PORT}/api/view-terms`);
    console.log(`🔗 CORS enabled for: http://localhost:5174`);
    console.log('=================================');
});

module.exports = app;