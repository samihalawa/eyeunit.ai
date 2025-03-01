require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const app = express();

// Validate environment variables
function validateEnvironment() {
    const requiredVars = ['HUGGINGFACE_API_KEY'];
    const missingVars = [];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        console.error('Please set these variables in your .env file or environment');
    } else {
        console.log('All required environment variables are set');
    }

    // Log the current environment
    console.log(`Running in ${process.env.NODE_ENV || 'default'} mode`);
}

// Call validation function 
validateEnvironment();

// Configure rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
});

// Define allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'https://eyeunit.ai', null]
    : ['https://eyeunit.ai', /\.eyeunit\.ai$/, /\.cloudflare\.com$/, /\.pages\.dev$/];

// Enable CORS with flexible configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is explicitly allowed
        if (typeof allowedOrigins === 'string' && origin === allowedOrigins) {
            return callback(null, true);
        }
        
        // Check against array of origins
        if (Array.isArray(allowedOrigins)) {
            let isAllowed = false;
            for (let allowedOrigin of allowedOrigins) {
                // Check for exact match or regex pattern
                if (typeof allowedOrigin === 'string' && origin === allowedOrigin) {
                    isAllowed = true;
                    break;
                } else if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
                    isAllowed = true;
                    break;
                }
            }
            
            if (isAllowed) {
                return callback(null, true);
            }
        }
        
        // Log for debugging
        console.log(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
    
    console.log(`API config request from origin: ${origin}, NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Skip origin check for Cloudflare Pages domains or in development mode
    if (!origin) {
        console.log('No origin header - allowing request');
    } else if (process.env.NODE_ENV === 'production' && 
              (!isOriginAllowed(origin, allowedOrigins) && 
               !origin.includes('pages.dev') && 
               !origin.includes('cloudflare'))) {
        console.log(`API config access blocked for origin: ${origin}`);
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

// Helper function to check if origin is allowed
function isOriginAllowed(origin, allowedOrigins) {
    if (!origin || !allowedOrigins) return false;
    
    if (typeof allowedOrigins === 'string') {
        return origin === allowedOrigins;
    }
    
    if (Array.isArray(allowedOrigins)) {
        for (let allowedOrigin of allowedOrigins) {
            if (typeof allowedOrigin === 'string' && origin === allowedOrigin) {
                return true;
            } else if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
                return true;
            }
        }
    }
    
    return false;
}

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

// Health check endpoint - useful for Cloudflare and troubleshooting
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'default',
        apiKeyConfigured: !!process.env.HUGGINGFACE_API_KEY
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
