require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const { SocksServer } = require('socks5-server'); // NEW: SOCKS5

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET_URL;
const SOCKS_PORT = process.env.SOCKS_PORT || 1080; // default SOCKS5 port

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
    node: process.version,
    socks_port: SOCKS_PORT
  });
});

// Proxy Configuration
const proxyConfig = {
  target: TARGET,
  changeOrigin: true,
  logLevel: 'debug',
  secure: true,
  xfwd: true,
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

// Apply HTTP proxy to all routes
app.use('/', createProxyMiddleware(proxyConfig));

// Start Express server
app.listen(PORT, () => {
  console.log(`
  🚀 HTTP Proxy Server Ready!
  --------------------------
  Local: http://localhost:${PORT}
  Target: ${TARGET}
  Node: ${process.version}
  `);
});

// Start SOCKS5 server in parallel
const socksServer = new SocksServer({
  authenticate: (username, password, cb) => cb(true), // no auth
});

socksServer.listen(SOCKS_PORT, () => {
  console.log(`🛡️  SOCKS5 Proxy running on port ${SOCKS_PORT}`);
});
