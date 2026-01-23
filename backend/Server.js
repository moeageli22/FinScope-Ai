// backend/server.js or backend/index.js
const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5173;

// ===== MIDDLEWARE =====

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:5174', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===== ROUTES =====

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinScope AI Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Contact form routes
app.use('/api', contactRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
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
    console.log('=================================');
});

module.exports = app;