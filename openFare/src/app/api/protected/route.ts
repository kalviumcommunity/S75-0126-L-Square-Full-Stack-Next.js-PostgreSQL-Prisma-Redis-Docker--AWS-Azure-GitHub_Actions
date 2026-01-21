import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

export async function GET(req: Request) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      );
    }

    // Check if it's a Bearer token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token missing from Authorization header' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Token is valid, return protected data
    return NextResponse.json({
      success: true,
      message: 'Access granted to protected route',
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
      data: {
        info: 'This is protected data only accessible with valid token',
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    // Token verification failed
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 403 }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, message: 'Token has expired' },
        { status: 403 }
      );
    }

    console.error('TOKEN VERIFICATION ERROR >>>', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}