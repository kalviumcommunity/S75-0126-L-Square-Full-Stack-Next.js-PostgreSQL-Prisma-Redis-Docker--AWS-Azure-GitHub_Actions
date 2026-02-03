// lib/auth.ts - Reusable authentication helper
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * Verify JWT token from Authorization header
 * Returns decoded payload or null if invalid
 */
export function verifyToken(authHeader: string | null): JwtPayload | null {
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract and verify token from request
 * Returns user payload or error response
 */
export async function authenticateRequest(req: Request): Promise<
  { success: true; user: JwtPayload } | { success: false; response: NextResponse }
> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Token missing' },
        { status: 401 }
      ),
    };
  }

  try {
    const user = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    return { success: true, user };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Token has expired' },
          { status: 403 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 403 }
      ),
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: JwtPayload, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Verify user has admin role
 */
export function isAdmin(user: JwtPayload): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Verify user has operator role
 */
export function isOperator(user: JwtPayload): boolean {
  return user.role === UserRole.OPERATOR;
}