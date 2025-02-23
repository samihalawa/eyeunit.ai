require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const app = express();

// Configure rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
});

// Enable CORS with specific origin
const allowedOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'https://eyeunit.ai']
    : ['https://eyeunit.ai'];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Add security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Basic request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from root
app.use(express.static('.'));

// Endpoint to get HuggingFace API key
app.get('/api/config', (req, res) => {
    const origin = req.headers.origin;
    if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }
    
    if (!process.env.HUGGINGFACE_API_KEY) {
        console.error('HUGGINGFACE_API_KEY not found in environment variables');
        return res.status(500).json({ error: 'API key not configured' });
    }
    
    res.json({
        huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY
    });
});

// Contact form endpoint with rate limiting
app.post('/api/contact', limiter, async (req, res) => {
    try {
        const { name, email, organization, subject, message } = req.body;
        
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"${name}" <${process.env.EMAIL_USER}>`,
            replyTo: email,
            to: process.env.EMAIL_TO,
            subject: 'New Message From EyeUnit.ai',
            text: `
Name: ${name}
Email: ${email}
Organization: ${organization || 'Not provided'}
Subject: ${subject}
Message: ${message}
            `,
            html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
});

// Redirect /blog to /blog/index.html
app.get('/blog', (req, res) => {
    res.redirect('/blog/index.html');
});

// Handle 404s
app.use((req, res) => {
    console.log(`404: ${req.url}`);
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
