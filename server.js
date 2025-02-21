const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const app = express();

// Configure rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
});

// Parse JSON bodies
app.use(express.json());

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
        user: 'eugproductions@gmail.com',
        pass: 'rovt fswq crlv bhzk'
    }
});

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from root
app.use(express.static('.'));

// Contact form endpoint with rate limiting
app.post('/api/contact', limiter, async (req, res) => {
    try {
        const { name, email, organization, subject, message } = req.body;
        
        // Email content
        const mailOptions = {
            from: `"${name}" <eugproductions@gmail.com>`,
            replyTo: email,
            to: 'fernandolyyang@gmail.com',
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