import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { env } from '../../core/config/env.js';
import { fail } from '../response/api-response.js';
import { AppUser } from '../users/app-user.model.js';

export interface AuthenticatedRequest extends Request {
  auth?: { userId: string; sessionId: string };
}

/**
 * Verifies the Clerk session token from Authorization: Bearer <token>.
 *
 * WHY verifyToken instead of authenticateRequest:
 *   authenticateRequest() expects a Web Fetch API Request object with a
 *   headers.get() method. Express IncomingMessage uses a plain object for
 *   headers, so authenticateRequest() always sees no token and returns
 *   isSignedIn=false. verifyToken() takes the raw string directly.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json(fail('UNAUTHORIZED', 'Missing or invalid Authorization header'));
    return;
  }

  const token = authHeader.slice(7);
  if (!token) {
    res.status(401).json(fail('UNAUTHORIZED', 'Missing token'));
    return;
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      authorizedParties: [env.CORS_ORIGIN],
    });

    (req as AuthenticatedRequest).auth = {
      userId: payload.sub,
      sessionId: (payload as typeof payload & { sid: string }).sid,
    };

    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token verification failed';
    res.status(401).json(fail('UNAUTHORIZED', message));
  }
}

/**
 * requireAdmin — chains requireAuth + MongoDB role check.
 *
 * Verifies the Clerk token first, then looks up the AppUser document
 * in MongoDB to confirm role === 'ADMIN'.
 *
 * The role is NEVER trusted from the frontend — always read from the DB.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Step 1: verify Clerk token and populate req.auth
  await new Promise<void>((resolve) => {
    void requireAuth(req, res, () => resolve());
  });

  // If requireAuth already sent a response (401), stop here.
  if (res.headersSent) return;

  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  // Step 2: look up role in MongoDB — never trust the frontend.
  const appUser = await AppUser.findOne({ clerkId }).select('role').lean();

  if (!appUser) {
    res.status(403).json(fail('FORBIDDEN', 'User not provisioned — call /users/sync first'));
    return;
  }

  if (appUser.role !== 'ADMIN') {
    res.status(403).json(fail('FORBIDDEN', 'Admin access required'));
    return;
  }

  next();
}
