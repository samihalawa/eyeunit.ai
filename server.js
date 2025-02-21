const express = require('express');
const path = require('path');
const app = express();

// Basic request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files
app.use(express.static('.'));

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