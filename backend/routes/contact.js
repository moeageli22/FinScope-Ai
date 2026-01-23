// backend/routes/contact.js
const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend('re_GF41aVJg_5Ek1QwtztqALjuGLMaAxF4qV');

router.post('/send-contact-email', async (req, res) => {
    try {
        console.log('Received contact form submission:', req.body);

        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({
                error: 'Missing required fields',
                success: false
            });
        }

        console.log('Sending emails...');

        // Email to owner (you)
        const ownerEmail = await resend.emails.send({
            from: 'FinScope AI <onboarding@resend.dev>', // Use Resend's test domain for now
            to: 'mohammadmunir2004@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            color: white;
                            padding: 20px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                        }
                        .content {
                            background: #f9fafb;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                            border: 1px solid #e5e7eb;
                        }
                        .field {
                            margin-bottom: 20px;
                        }
                        .label {
                            font-weight: bold;
                            color: #3b82f6;
                            margin-bottom: 5px;
                        }
                        .value {
                            background: white;
                            padding: 10px;
                            border-radius: 5px;
                            border: 1px solid #e5e7eb;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #6b7280;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>🔔 New Contact Form Submission</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">From:</div>
                            <div class="value">${name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div class="value">${email}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div class="value">${message.replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Sent from FinScope AI Contact Form</p>
                    </div>
                </body>
                </html>
            `
        });

        console.log('Owner email sent:', ownerEmail);

        // Auto-reply email to user
        const userEmail = await resend.emails.send({
            from: 'FinScope AI <onboarding@resend.dev>', // Use Resend's test domain for now
            to: email,
            subject: 'Thank You for Contacting FinScope AI',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            color: white;
                            padding: 30px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                        }
                        .logo {
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .content {
                            background: #f9fafb;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                            border: 1px solid #e5e7eb;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #3b82f6;
                            margin-bottom: 15px;
                        }
                        .message {
                            margin-bottom: 20px;
                        }
                        .info-box {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            border-left: 4px solid #3b82f6;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            color: #6b7280;
                            font-size: 14px;
                        }
                        .button {
                            display: inline-block;
                            background: linear-gradient(135deg, #06b6d4, #3b82f6);
                            color: white;
                            padding: 12px 30px;
                            border-radius: 8px;
                            text-decoration: none;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">FinScope AI</div>
                        <p>Your Intelligent Banking Companion</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello ${name}! 👋</div>
                        
                        <div class="message">
                            <p>Thank you for reaching out to <strong>FinScope AI</strong>! We've received your message and our team will review it carefully.</p>
                        </div>

                        <div class="info-box">
                            <p><strong>📧 Your Message:</strong></p>
                            <p style="color: #6b7280; margin-top: 10px;">"${message}"</p>
                        </div>

                        <div class="message">
                            <p><strong>What happens next?</strong></p>
                            <ul style="color: #6b7280;">
                                <li>Our team will review your inquiry within 24-48 hours</li>
                                <li>You'll receive a personalized response at <strong>${email}</strong></li>
                                <li>For urgent matters, feel free to reach us directly at mohammadmunir2004@gmail.com</li>
                            </ul>
                        </div>

                        <div style="text-align: center;">
                            <a href="http://localhost:3000" class="button">Visit FinScope AI</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p><strong>FinScope AI</strong> - Intelligent Banking Solutions</p>
                        <p>📍 London, United Kingdom | 📧 mohammadmunir2004@gmail.com</p>
                        <p style="margin-top: 15px; font-size: 12px;">
                            Created by Mohammed Ageli - London South Bank University
                        </p>
                    </div>
                </body>
                </html>
            `
        });

        console.log('User email sent:', userEmail);
        console.log('Emails sent successfully!');

        // IMPORTANT: Send proper JSON response
        return res.status(200).json({
            success: true,
            message: 'Emails sent successfully',
            ownerEmailId: ownerEmail.id,
            userEmailId: userEmail.id
        });

    } catch (error) {
        console.error('Error sending emails:', error);

        // IMPORTANT: Send proper JSON error response
        return res.status(500).json({
            success: false,
            error: 'Failed to send emails',
            details: error.message
        });
    }
});

module.exports = router;