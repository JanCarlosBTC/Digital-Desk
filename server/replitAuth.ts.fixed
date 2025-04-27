import passport from "passport";
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";

const pgStore = connectPg(session);

// Type for the authenticated request with user
export interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to check if the user is authenticated
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // In development mode, bypass authentication for easier testing
  if (process.env.NODE_ENV !== 'production') {
    // Add a personal user account to the request
    (req as any).user = {
      id: "personal123",
      username: "v4yl1n",
      email: "v4yl1n@gmail.com",
      name: "V4YL1N",
      initials: "V4",
      isAdmin: true,
      lastLogin: new Date()
    };
    return next();
  }
  
  // In production, check if the user is authenticated
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
}

// Get OpenID Connect configuration from Replit
const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

// Setup session store
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-not-for-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Update user session with tokens
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Setup auth for the Express app
export async function setupAuth(app: Express) {
  try {
    // Set trust proxy for secure cookies behind proxy
    app.set("trust proxy", 1);
    
    // Use session middleware
    app.use(getSession());
    
    // Initialize passport
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Get OpenID Connect configuration
    const config = await getOidcConfig();
    
    // Set up verification function for OpenID Connect
    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      
      // Upsert user in the database (handled by authStorage)
      // In a real implementation, we would call authStorage.upsertUser here
      
      verified(null, user);
    };
    
    // Set up authentication strategies for each domain
    if (process.env.REPLIT_DOMAINS) {
      for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
        const strategy = new Strategy(
          {
            name: `replitauth:${domain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify,
        );
        passport.use(strategy);
      }
    } else {
      console.warn("REPLIT_DOMAINS environment variable not set. Authentication will only work in development mode.");
    }
    
    // Set up serialization
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    
    // Login route - redirects to Replit Auth
    app.get("/api/login", (req, res, next) => {
      // In development mode, redirect to the local login page
      if (process.env.NODE_ENV !== 'production') {
        return res.redirect("/login");
      }
      
      // In production, use Replit Auth with the hostname for the current request
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });
    
    // Callback route that processes the OAuth response
    app.get("/api/callback", (req, res, next) => {
      if (process.env.NODE_ENV !== 'production') {
        return res.redirect("/");
      }
      
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });
    
    // Logout route
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        if (process.env.NODE_ENV !== 'production') {
          return res.redirect("/");
        }
        
        // In production, redirect to Replit's logout endpoint
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
    
    console.log("Auth routes configured (OpenID Connect with Replit)");
  } catch (error) {
    console.error("Error setting up authentication:", error);
  }
}