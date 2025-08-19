require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET_URL;

// Validate config
if (!TARGET) {
  console.error('❌ Error: TARGET_URL missing in .env');
  process.exit(1);
}

// Middlewares
app.use(morgan('dev'));  // Request logging

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: '🟢 UP',
    proxy: 'Signal Proxy',
    target: TARGET,
    node: process.version
  });
});

// Proxy Configuration
const proxyConfig = {
  target: TARGET,
  changeOrigin: true,
  logLevel: 'debug',
  secure: true,
  xfwd: true,  // Forward headers
  on: {
    error: (err, req, res) => {
      console.error(`Proxy Error: ${err.message}`);
      res.status(502).json({ error: 'Bad Gateway' });
    },
    proxyReq: (proxyReq) => {
      proxyReq.setHeader('X-Special-Proxy', 'Railway-Signal');
    }
  }
};

// Apply proxy to all routes
app.use('/', createProxyMiddleware(proxyConfig));

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Proxy Server Ready!
  --------------------------
  Local: http://localhost:${PORT}
  Target: ${TARGET}
  Node: ${process.version}
  `);
});
