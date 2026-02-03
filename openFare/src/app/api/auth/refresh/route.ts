import { NextResponse } from 'next/server';
import { 
  verifyRefreshToken, 
  generateAccessToken, 
  generateRefreshToken,
  getRefreshTokenFromRequest,
  setAuthCookies
} from '@/lib/tokenManager';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Get refresh token from cookies
    const refreshToken = getRefreshTokenFromRequest(req);
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token not provided' },
        { status: 401 }
      );
    }

    // Verify the refresh token
    const decodedRefreshToken = await verifyRefreshToken(refreshToken);
    
    if (!decodedRefreshToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired refresh token' },
        { status: 403 }
      );
    }

    // Check if user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decodedRefreshToken.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User no longer exists' },
        { status: 403 }
      );
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate new refresh token (token rotation)
    const newRefreshToken = await generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with new access token
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      accessToken: newAccessToken,
    });

    // Set the new refresh token in HTTP-only cookie
    return setAuthCookies(response, newRefreshToken);

  } catch (error) {
    console.error('REFRESH TOKEN ERROR >>>', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Refresh token failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}