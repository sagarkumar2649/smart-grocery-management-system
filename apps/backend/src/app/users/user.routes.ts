import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { syncUser, getAppUser } from './user.controller.js';

export function buildUserRouter(): Router {
  const router = Router();

  // POST /users/sync — upsert AppUser from Clerk session (frontend calls on login)
  router.post('/sync', requireAuth, syncUser);

  // GET /users/me — return current user + role
  router.get('/me', requireAuth, getAppUser);

  return router;
}
