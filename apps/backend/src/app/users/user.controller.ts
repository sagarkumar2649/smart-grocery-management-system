import type { Request, Response } from 'express';
import { AppUser, ADMIN_EMAIL, type AppUserRole } from './app-user.model.js';
import { ok, fail } from '../response/api-response.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

/**
 * POST /api/v1/users/sync
 *
 * Called by the frontend immediately after Clerk sign-in.
 * Upserts an AppUser document keyed on the Clerk userId.
 *
 * Role assignment (permanent — never changes after first creation):
 *   ss5375492@gmail.com  → ADMIN
 *   everyone else        → CUSTOMER
 *
 * Requires: requireAuth middleware (Clerk JWT).
 */
export async function syncUser(req: Request, res: Response): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  const { name, email } = req.body as { name?: string; email?: string };

  if (!email) {
    res.status(400).json(fail('VALIDATION_ERROR', 'email is required'));
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find or create — role is set on first creation and never overwritten.
  let user = await AppUser.findOne({ clerkId });

  if (!user) {
    const role: AppUserRole =
      normalizedEmail === ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'CUSTOMER';

    user = await AppUser.create({
      clerkId,
      name: name?.trim() ?? normalizedEmail,
      email: normalizedEmail,
      role,
    });
  } else {
    // Keep email/name in sync with Clerk but never change role.
    user.name = name?.trim() ?? user.name;
    user.email = normalizedEmail;
    await user.save();
  }

  res.status(200).json(
    ok({ id: user.id, clerkId: user.clerkId, name: user.name, email: user.email, role: user.role }),
  );
}

/**
 * GET /api/v1/users/me
 *
 * Returns the current user's AppUser document (role, etc.).
 * Requires: requireAuth middleware.
 */
export async function getAppUser(req: Request, res: Response): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail('UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  const user = await AppUser.findOne({ clerkId });
  if (!user) {
    res.status(404).json(fail('NOT_FOUND', 'User not found — call /users/sync first'));
    return;
  }

  res.status(200).json(
    ok({ id: user.id, clerkId: user.clerkId, name: user.name, email: user.email, role: user.role }),
  );
}
