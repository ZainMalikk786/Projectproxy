const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Signal ka official server URL ya jis server ka proxy banana hai
const SIGNAL_SERVER_URL = 'https://signal.org';

app.use('/', createProxyMiddleware({
  target: SIGNAL_SERVER_URL,
  changeOrigin: true,
  logLevel: 'debug'
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Signal proxy running on port ${PORT}`);
});
