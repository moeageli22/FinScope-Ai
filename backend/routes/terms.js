// backend/routes/terms.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Get the absolute path to the backend directory
// This assumes Server.js is in the backend directory
const BACKEND_DIR = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(BACKEND_DIR, 'uploads');
const PDF_FILE = path.join(UPLOADS_DIR, 'FinScopeAITerms.pdf');

console.log('=== Terms Routes Initialized ===');
console.log('Backend directory:', BACKEND_DIR);
console.log('Uploads directory:', UPLOADS_DIR);
console.log('PDF file path:', PDF_FILE);
console.log('PDF exists?', fs.existsSync(PDF_FILE));
if (fs.existsSync(UPLOADS_DIR)) {
    console.log('Files in uploads:', fs.readdirSync(UPLOADS_DIR));
}
console.log('================================');

// DEBUG ENDPOINT
router.get('/debug-terms', (req, res) => {
    const debugInfo = {
        backendDir: BACKEND_DIR,
        uploadsDir: UPLOADS_DIR,
        pdfFile: PDF_FILE,
        pdfExists: fs.existsSync(PDF_FILE),
        uploadsDirExists: fs.existsSync(UPLOADS_DIR),
        filesInUploads: fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : 'Directory does not exist',
        currentWorkingDirectory: process.cwd(),
        routesDirname: __dirname,
    };

    res.json(debugInfo);
});

// Route to download Terms & Conditions PDF
router.get('/download-terms', (req, res) => {
    try {
        console.log('\n=== PDF Download Request ===');
        console.log('Looking for PDF at:', PDF_FILE);
        console.log('File exists?', fs.existsSync(PDF_FILE));

        if (!fs.existsSync(PDF_FILE)) {
            console.error('❌ PDF file not found!');
            console.log('Uploads directory contents:', fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : 'Dir not found');

            return res.status(404).json({
                error: 'PDF file not found',
                message: 'The Terms & Conditions PDF could not be found on the server.',
                attemptedPath: PDF_FILE,
                uploadsDirExists: fs.existsSync(UPLOADS_DIR),
                filesInUploads: fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : null
            });
        }

        const stats = fs.statSync(PDF_FILE);
        console.log('✅ File found! Size:', stats.size, 'bytes');

        if (stats.size === 0) {
            console.error('❌ PDF file is empty');
            return res.status(500).json({
                error: 'Invalid PDF file',
                message: 'The PDF file exists but is empty.'
            });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="FinScopeAITerms.pdf"');
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'no-cache');

        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(PDF_FILE);

        fileStream.on('error', (error) => {
            console.error('❌ Error reading file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to read PDF file',
                    message: error.message
                });
            }
        });

        fileStream.on('open', () => {
            console.log('✅ File stream opened, sending PDF...');
        });

        fileStream.on('end', () => {
            console.log('✅ PDF sent successfully!');
        });

        fileStream.pipe(res);

    } catch (error) {
        console.error('❌ Error in download-terms route:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process PDF download request.',
            details: error.message,
            stack: error.stack
        });
    }
});

// Route to view Terms & Conditions PDF in browser
router.get('/view-terms', (req, res) => {
    try {
        console.log('\n=== PDF View Request ===');
        console.log('Looking for PDF at:', PDF_FILE);

        if (!fs.existsSync(PDF_FILE)) {
            console.error('❌ PDF file not found!');
            return res.status(404).json({
                error: 'PDF file not found',
                message: 'The Terms & Conditions PDF could not be found on the server.'
            });
        }

        const stats = fs.statSync(PDF_FILE);
        console.log('✅ File found! Size:', stats.size, 'bytes');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="FinScopeAITerms.pdf"');
        res.setHeader('Content-Length', stats.size);

        const fileStream = fs.createReadStream(PDF_FILE);

        fileStream.on('error', (error) => {
            console.error('❌ Error reading file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to read PDF file',
                    message: error.message
                });
            }
        });

        fileStream.pipe(res);

    } catch (error) {
        console.error('❌ Error in view-terms route:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process PDF view request.',
            details: error.message
        });
    }
});

module.exports = router;