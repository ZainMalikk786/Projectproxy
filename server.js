const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const socks = require('socksv5');
require('dotenv').config();

class SignalProxyServer {
  constructor() {
    this.config = this.loadConfig();
    this.app = express();
    this.setupHttpProxy();
    this.setupHealthCheck();
    this.setupErrorHandling();
  }

  loadConfig() {
    return {
      target: process.env.TARGET_URL || 'https://chat.signal.org',
      port: parseInt(process.env.PORT) || 3000,
      socksPort: parseInt(process.env.SOCKS_PORT) || 1080,
      logLevel: process.env.LOG_LEVEL || 'info'
    };
  }

  setupHttpProxy() {
    const proxyOptions = {
      target: this.config.target,
      changeOrigin: true,
      logLevel: this.config.logLevel,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('X-Special-Proxy', 'Railway-Signal');
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(502).json({ error: 'Proxy gateway error' });
      }
    };

    this.app.use('/', createProxyMiddleware(proxyOptions));
  }

  setupHealthCheck() {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        target: this.config.target,
        httpPort: this.config.port,
        socksPort: this.config.socksPort,
        nodeVersion: process.version
      });
    });
  }

  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error('Server Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  startSocksServer() {
    this.socksServer = socks.createServer((info, accept, deny) => {
      console.log('SOCKS5 Connection:', info.srcAddr, info.srcPort);
      accept();
    });

    this.socksServer.listen(this.config.socksPort, '0.0.0.0', () => {
      console.log(`SOCKS5 proxy listening on port ${this.config.socksPort}`);
    });

    this.socksServer.useAuth(socks.auth.None());
  }

  start() {
    this.server = this.app.listen(this.config.port, '0.0.0.0', () => {
      console.log(`HTTP proxy listening on port ${this.config.port}`);
      console.log(`Proxying to: ${this.config.target}`);
    });

    this.startSocksServer();

    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  shutdown() {
    console.log('Shutting down gracefully...');
    this.server.close();
    this.socksServer.close();
    process.exit(0);
  }
}

const proxyServer = new SignalProxyServer();
proxyServer.start();