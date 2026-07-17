import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../users/user.model.js';
import { AuthService } from './auth.service.js';
import { ok, fail } from '../response/api-response.js';
import { env } from '../../core/config/env.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const numStr = match[1];
  const unit = match[2];
  if (!numStr || !unit) return 30 * 24 * 60 * 60 * 1000;
  const n = parseInt(numStr, 10);
  switch (unit) {
    case 's': return n * 1000;
    case 'm': return n * 60 * 1000;
    case 'h': return n * 60 * 60 * 1000;
    case 'd': return n * 24 * 60 * 60 * 1000;
    default: return 30 * 24 * 60 * 60 * 1000;
  }
}

function setRefreshCookie(res: Response, token: string): void {
  const maxAge = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge,
  });
}

function clearRefreshCookie(res: Response): void {
  res.cookie(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 0,
  });
}

function getRefreshTokenFromCookie(req: Request): string | undefined {
  const cookie = req.cookies as Record<string, string | undefined>;
  return cookie[REFRESH_COOKIE_NAME];
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail('VALIDATION_ERROR', 'Invalid input data'));
    return;
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json(fail('UNAUTHORIZED', 'Invalid email or password'));
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json(fail('UNAUTHORIZED', 'Invalid email or password'));
    return;
  }

  const tokens = await AuthService.generateTokens(user);
  setRefreshCookie(res, tokens.refreshToken);

  res.status(200).json(
    ok({
      user: { id: user.id, email: user.email, role: user.role },
      accessToken: tokens.accessToken,
    }),
  );
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = getRefreshTokenFromCookie(req);
  if (refreshToken) {
    await AuthService.revokeRefreshToken(refreshToken);
  }
  clearRefreshCookie(res);

  res.status(200).json(ok({ message: 'Logged out successfully' }));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = getRefreshTokenFromCookie(req);
  if (!refreshToken) {
    res.status(401).json(fail('UNAUTHORIZED', 'Refresh token not provided'));
    return;
  }

  try {
    const storedToken = await AuthService.verifyRefreshToken(refreshToken);
    const user = await User.findById(storedToken.user);

    if (!user) {
      clearRefreshCookie(res);
      res.status(401).json(fail('UNAUTHORIZED', 'User not found'));
      return;
    }

    const tokens = await AuthService.rotateRefreshToken(refreshToken, user);
    setRefreshCookie(res, tokens.refreshToken);

    res.status(200).json(
      ok({ accessToken: tokens.accessToken }),
    );
  } catch {
    clearRefreshCookie(res);
    res.status(401).json(fail('UNAUTHORIZED', 'Invalid or expired refresh token'));
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  // After the Clerk middleware runs, userId is the Clerk user ID.
  // We match it against our local User records by clerkId field.
  const clerkUserId = (req as { auth?: { userId?: string } }).auth?.userId;
  if (!clerkUserId) {
    res.status(401).json(fail('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  const user = await User.findOne({ clerkId: clerkUserId });
  if (!user) {
    res.status(404).json(fail('NOT_FOUND', 'User not found'));
    return;
  }

  res.status(200).json(ok({ id: user.id, email: user.email, role: user.role }));
}
