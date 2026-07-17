import { Router } from 'express';
import { login, logout, refresh, getMe } from './auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export function buildAuthRouter(): Router {
  const router = Router();
  router.post('/login', login);
  router.post('/logout', logout);
  router.post('/refresh', refresh);
  router.get('/me', requireAuth, getMe);
  return router;
}
