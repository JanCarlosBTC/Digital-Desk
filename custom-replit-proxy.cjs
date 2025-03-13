// custom-replit-proxy.cjs - Enhanced proxy server for Replit environment
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const corsMiddleware = require('./cors-middleware.cjs');
const allowedHostsMiddleware = require('./replit-allowed-hosts.cjs');

// Create Express app
const app = express();
const PORT = 3000;

// Add CORS middleware from npm
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Add our custom middlewares
app.use(corsMiddleware);
app.use(allowedHostsMiddleware);

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`[PROXY] ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  next();
});

// Set up proxy for all requests
const proxyOptions = {
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/api': '/api' // keep API paths as they are
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] Forwarding: ${req.method} ${req.url} to main server`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${err.message}`);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
};

// Apply proxy to all routes
app.use('/', createProxyMiddleware(proxyOptions));

// Start proxy server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[PROXY] Enhanced Replit proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`[PROXY] Forwarding all requests to http://localhost:5000`);
});
