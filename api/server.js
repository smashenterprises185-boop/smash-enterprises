const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Configure Multer for handling file attachments in memory
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files (HTML, CSS, images) from the root directory
app.use(express.static(path.join(__dirname)));

// Configure Nodemailer transporter using environment variables (.env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // smashenterprises185@gmail.com
        pass: process.env.EMAIL_PASS  // Your Gmail App Password
    }
});

// Endpoint for contact or order inquiries
app.post('/api/inquiry', async (req, res) => {
    const { name, email, service, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'smashenterprises185@gmail.com',
        subject: `New Project Inquiry from ${name || 'Client'}`,
        text: `You have received a new inquiry:\n\nName: ${name}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email.' });
    }
});

// Endpoint specifically for project orders (with Multer file upload handling)
app.post('/api/order', upload.single('projectFile'), async (req, res) => {
    const { clientName, clientEmail, projectDetails, budget } = req.body;
    const file = req.file; // The uploaded file object from the form

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'smashenterprises185@gmail.com',
        subject: `🚨 New Order Blueprint from ${clientName || 'Client'}`,
        text: `New order submission details:\n\nName: ${clientName}\nEmail: ${clientEmail}\nBudget: ${budget}\nDetails: ${projectDetails}`,
        attachments: file ? [{ filename: file.originalname, content: file.buffer }] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Order details sent successfully!' });
    } catch (error) {
        console.error('Error sending order email:', error);
        res.status(500).json({ success: false, error: 'Failed to send order email.' });
    }
});

// For local testing
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// Export for Vercel Serverless deployment
module.exports = app;