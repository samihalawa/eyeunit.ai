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

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Configure nodemailer with Yahoo SMTP
    const transporter = nodemailer.createTransport({
      service: 'Yahoo',
      auth: {
        user: process.env.YAHOO_EMAIL || 'eyeunitai@yahoo.com',
        pass: process.env.YAHOO_APP_PASSWORD // App-specific password
      }
    });
    
    // Email content
    const mailOptions = {
      from: process.env.YAHOO_EMAIL || 'eyeunitai@yahoo.com',
      replyTo: email,
      to: process.env.YAHOO_EMAIL || 'eyeunitai@yahoo.com',
      subject: `[EyeUnit.AI Contact] ${subject}`,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Organization: ${organization || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
Sent from EyeUnit.AI Contact Form
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #3B82F6;">New Contact Form Submission</h2>
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
      ${message.replace(/\n/g, '<br>')}
    </div>
  </div>
  <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Sent from EyeUnit.AI Contact Form</p>
</div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    
    // Send a more specific error message based on the error type
    let errorMessage = 'Failed to send message. Please try again later.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please contact support.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    res.status(500).json({ success: false, message: errorMessage });
  }
} 