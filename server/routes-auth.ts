import { Router } from 'express';
import type { Response, Request } from 'express';

const router = Router();

// Just redirect all calls to the main auth endpoints
// This is needed because the client is still using /api/auth/user
router.get('/auth/user', (req: Request, res: Response) => {
  console.log("Redirecting from /api/auth/user to /api/user");
  req.url = '/api/user';
  return res.redirect('/api/user');
});

export default router;