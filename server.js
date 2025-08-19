require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Logging
app.use(morgan('combined'));

// Proxy target
const TARGET_URL = process.env.TARGET_URL || 'https://signal.org';

// Proxy middleware
app.use('/', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  logLevel: 'debug',
  onError(err, req, res) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy encountered an error.');
  }
}));

// Railway port or fallback
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Signal proxy running on port ${PORT}`));
