// Import compatibility layer first
import "./compat.js";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { setupMiddleware } from "./middleware/index.js";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";

// Initialize Express application
const app = express();

// Set up all middleware using our organized approach
setupMiddleware(app);

// Configuration
app.use(cors());
app.use(morgan("dev"));

// Parse JSON bodies for regular routes
app.use((req, res, next) => {
  // Special handling for Stripe webhook which needs raw body
  if (req.originalUrl === '/api/webhooks/stripe') {
    next(); // Skip body-parser for stripe webhooks
  } else {
    bodyParser.json()(req, res, next);
  }
});

// Serve static files
app.use(express.static("public"));

(async () => {
  const server = await registerRoutes(app);

  // Note: Error handling is now managed by errorHandlerMiddleware
  // which was set up in the setupMiddleware function

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
