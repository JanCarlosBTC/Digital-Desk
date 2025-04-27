import { Router } from 'express';
import type { Response, Request } from 'express';

const router = Router();

// Just redirect all calls to the main auth endpoints
// This is needed because the client is still using /api/auth/user
router.get('/auth/user', (req: Request, res: Response, next: Function) => {
  console.log("Forwarding from /api/auth/user to /api/user");
  // Instead of redirecting, forward the request to the /api/user handler
  // but keep the original URL so client sees response from the expected endpoint
  req.url = '/user';
  next();
});

// Also handle the login endpoint
router.get('/auth/login', (req: Request, res: Response) => {
  console.log("Redirecting from /api/auth/login to /api/login");
  res.redirect('/api/login');
});

// Handle the logout endpoint
router.post('/auth/logout', (req: Request, res: Response) => {
  console.log("Redirecting from /api/auth/logout to /api/logout");
  res.redirect(307, '/api/logout'); // 307 preserves the POST method
});

export default router;