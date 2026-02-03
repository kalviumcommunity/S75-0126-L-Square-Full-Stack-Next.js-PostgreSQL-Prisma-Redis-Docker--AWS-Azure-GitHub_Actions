import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { UserRole } from '@prisma/client';

interface BaseJwtPayload extends JWTPayload {
  id: number;
  email: string;
  role: UserRole;
}

export interface AccessTokenPayload extends BaseJwtPayload {
  type: 'access';
}

export interface RefreshTokenPayload extends BaseJwtPayload {
  type: 'refresh';
  jti?: string; // JWT ID for token revocation
}

const encoder = new TextEncoder();

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_access_secret'
);

const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret'
);

/**
 * Generate access token (short-lived)
 */
export async function generateAccessToken(payload: { id: number; email: string; role: UserRole }): Promise<string> {
  const tokenPayload: AccessTokenPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    type: 'access'
  };
  
  return new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.ACCESS_TOKEN_EXPIRY || '15m')
    .sign(ACCESS_TOKEN_SECRET);
}

/**
 * Generate refresh token (long-lived)
 */
export async function generateRefreshToken(
  payload: { id: number; email: string; role: UserRole }, 
  tokenId?: string
): Promise<string> {
  const tokenPayload: RefreshTokenPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    type: 'refresh',
    ...(tokenId && { jti: tokenId })
  };
  
  return new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRY || '7d')
    .sign(REFRESH_TOKEN_SECRET);
}

/**
 * Verify access token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const verified = await jwtVerify(token, ACCESS_TOKEN_SECRET);
    const payload = verified.payload as AccessTokenPayload;
    
    if (payload.type === 'access') {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const verified = await jwtVerify(token, REFRESH_TOKEN_SECRET);
    const payload = verified.payload as RefreshTokenPayload;
    
    if (payload.type === 'refresh') {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set secure HTTP-only cookies for tokens
 */
export function setAuthCookies(response: NextResponse, refreshToken: string): NextResponse {
  // Set refresh token as HTTP-only cookie (more secure)
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/api/auth/refresh', // Only accessible to refresh endpoint
  });
  
  return response;
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('refreshToken');
  return response;
}

/**
 * Extract refresh token from request
 */
export function getRefreshTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const refreshTokenMatch = cookieHeader.match(/refreshToken=([^;]+)/);
  return refreshTokenMatch ? refreshTokenMatch[1] : null;
}

/**
 * Store refresh token in database for revocation checking
 */
export async function storeRefreshToken(userId: number, tokenId: string): Promise<void> {
  // Simple in-memory storage for token rotation (in production, use Redis or database)
  // For now, we'll implement token rotation by generating new tokens each time
  console.log(`Storing refresh token for user ${userId} with ID ${tokenId}`);
  // In a real implementation, you would store this in Redis or database
}

/**
 * Check if refresh token is valid and not revoked
 */
export async function isRefreshTokenValid(userId: number, tokenId: string): Promise<boolean> {
  // In a real implementation, you would check against stored tokens
  // For now, we'll assume the token is valid if it can be verified
  console.log(`Checking refresh token validity for user ${userId} with ID ${tokenId}`);
  return true; // Simplified for demo purposes
}

/**
 * Revoke refresh token (logout)
 */
export async function revokeRefreshToken(userId: number): Promise<void> {
  // In a real implementation, you would remove the token from storage
  console.log(`Revoking refresh token for user ${userId}`);
  // For demo purposes, we'll just log the action
}