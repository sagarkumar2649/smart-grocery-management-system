import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../core/config/env.js';
import { User, type IUser, type UserRole } from '../users/user.model.js';
import { RefreshToken, type IRefreshToken } from './refresh-token.model.js';

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

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

function generateFamilyId(): string {
  return crypto.randomUUID();
}

export class AuthService {
  static generateAccessToken(user: IUser): string {
    const payload: TokenPayload = { sub: user.id, role: user.role };
    // exactOptionalPropertyTypes requires we avoid undefined in SignOptions, cast via unknown
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as unknown as import('jsonwebtoken').SignOptions);
  }

  static generateRefreshToken(): string {
    return crypto.randomUUID();
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  }

  static async createRefreshToken(user: IUser, familyId?: string): Promise<string> {
    const tokenId = AuthService.generateRefreshToken();
    const payload: TokenPayload = { sub: user.id, role: user.role };
    const signedToken = jwt.sign({ ...payload, jti: tokenId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as unknown as import('jsonwebtoken').SignOptions);

    const ttlMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);

    await RefreshToken.create({
      token: tokenId,
      user: user._id,
      familyId: familyId ?? generateFamilyId(),
      usedAt: null,
      expiresAt: new Date(Date.now() + ttlMs),
    });

    return signedToken;
  }

  static async generateTokens(user: IUser, familyId?: string): Promise<Tokens> {
    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = await AuthService.createRefreshToken(user, familyId);
    return { accessToken, refreshToken };
  }

  static async verifyRefreshToken(signedToken: string): Promise<IRefreshToken> {
    const decoded = jwt.verify(signedToken, env.JWT_REFRESH_SECRET) as TokenPayload & { jti?: string };

    if (!decoded.jti) {
      throw new Error('Invalid refresh token');
    }

    const storedToken = await RefreshToken.findOne({ token: decoded.jti });

    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    if (storedToken.usedAt !== null) {
      await RefreshToken.deleteMany({ familyId: storedToken.familyId });
      throw new Error('Refresh token reuse detected');
    }

    return storedToken;
  }

  static async rotateRefreshToken(signedToken: string, user: IUser): Promise<Tokens> {
    const storedToken = await AuthService.verifyRefreshToken(signedToken);

    await RefreshToken.updateOne(
      { _id: storedToken._id },
      { usedAt: new Date() },
    );

    const accessToken = AuthService.generateAccessToken(user);
    const newRefreshToken = await AuthService.createRefreshToken(user, storedToken.familyId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async revokeRefreshToken(signedToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(signedToken, env.JWT_REFRESH_SECRET) as { jti?: string };
      if (decoded.jti) {
        await RefreshToken.deleteOne({ token: decoded.jti });
      }
    } catch {
      // Token invalid or expired, nothing to revoke
    }
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ user: userId });
  }

  static async findUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }
}
