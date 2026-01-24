// backend/routes/terms.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Route to download Terms & Conditions PDF
router.get('/download-terms', (req, res) => {
    try {
        // CORRECT PATH: Go up one level from routes/ to backend/, then to uploads/
        const file = path.join(__dirname, '../uploads/FinScopeAITerms.pdf');

        console.log('Attempting to send PDF from:', file); // Debug log

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=FinScopeAITerms.pdf');

        // Send the file
        res.sendFile(file, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(404).json({
                    error: 'PDF file not found',
                    message: 'The Terms & Conditions PDF could not be found on the server.',
                    attemptedPath: file
                });
            } else {
                console.log('PDF sent successfully!');
            }
        });
    } catch (error) {
        console.error('Error in download-terms route:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process PDF download request.'
        });
    }
});

// Route to view Terms & Conditions PDF in browser (optional)
router.get('/view-terms', (req, res) => {
    try {
        // CORRECT PATH: Go up one level from routes/ to backend/, then to uploads/
        const file = path.join(__dirname, '../uploads/FinScopeAITerms.pdf');

        // Set headers for inline viewing
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=FinScopeAITerms.pdf');

        res.sendFile(file, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(404).json({
                    error: 'PDF file not found'
                });
            }
        });
    } catch (error) {
        console.error('Error in view-terms route:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router;