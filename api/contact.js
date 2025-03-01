// Vercel Serverless Function for /api/contact endpoint
// Handles contact form submissions

const nodemailer = require('nodemailer');

// Configure rate limiting (simplified version for Vercel)
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  current: new Map(),
  reset: function() {
    this.current = new Map();
    setTimeout(() => this.reset(), this.windowMs);
  },
  check: function(ip) {
    const current = this.current.get(ip) || 0;
    if (current >= this.max) return false;
    this.current.set(ip, current + 1);
    return true;
  }
};

// Start the rate limit reset cycle
rateLimit.reset();

module.exports = async (req, res) => {
  // Set appropriate CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Only accept POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Apply rate limiting
  const ip = req.headers['x-forwarded-for'] || 'unknown-ip';
  if (!rateLimit.check(ip)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
  
  try {
    const { name, email, organization, subject, message } = req.body;
    
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
    
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
  }
} 