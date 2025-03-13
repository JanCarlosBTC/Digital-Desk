const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Start the main proxy server
const app = express();
const port = process.env.PORT || 3000;
const target = 'http://localhost:5000';

console.log('Starting Replit proxy server...');
console.log(`Target server: ${target}`);

// Add middleware to log requests
app.use((req, res, next) => {
  console.log(`Replit proxy received: ${req.method} ${req.url}`);
  console.log(`  Host: ${req.headers.host}`);
  console.log(`  Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Add CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Create proxy
const proxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    // Add custom headers to proxy request
    proxyReq.setHeader('X-Replit-Proxy', 'true');
    console.log(`Proxying request to: ${target}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Proxy response: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end(`Proxy Error: ${err.message}`);
  }
});

// Apply proxy to all routes
app.use('/', proxy);

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Replit proxy server running on port ${port}`);
});
