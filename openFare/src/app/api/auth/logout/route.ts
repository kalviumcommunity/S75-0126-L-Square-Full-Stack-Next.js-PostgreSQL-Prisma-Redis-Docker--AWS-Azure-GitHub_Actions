import { NextResponse } from 'next/server';
import { revokeRefreshToken } from '@/lib/tokenManager';
import { verifyAccessToken } from '@/lib/tokenManager';

export async function POST(req: Request) {
  try {
    // Get access token from Authorization header to identify user
    const authHeader = req.headers.get('authorization');
    let userId: number | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decodedToken = await verifyAccessToken(token);
      
      if (decodedToken) {
        userId = decodedToken.id;
      }
    }

    // Revoke refresh token if we can identify the user
    if (userId) {
      await revokeRefreshToken(userId);
    }

    // Create response and clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear refresh token cookie
    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    console.error('LOGOUT ERROR >>>', error);
    
    // Even if there's an error, still clear cookies
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Logout failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
    
    response.cookies.delete('refreshToken');
    return response;
  }
}