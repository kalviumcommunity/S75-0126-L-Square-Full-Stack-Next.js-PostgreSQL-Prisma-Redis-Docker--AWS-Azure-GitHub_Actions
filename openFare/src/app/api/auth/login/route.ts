import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/tokenManager';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Type assertion to include password field
    const typedUser = user as typeof user & { password: string };

    if (!typedUser) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, typedUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate access and refresh tokens
    const accessToken = await generateAccessToken({
      id: typedUser.id,
      email: typedUser.email,
      role: typedUser.role,
    });
    
    const refreshToken = await generateRefreshToken({
      id: typedUser.id,
      email: typedUser.email,
      role: typedUser.role,
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      accessToken, // Only send access token to the client
      user: {
        id: typedUser.id,
        name: typedUser.name,
        email: typedUser.email,
        phone: typedUser.phone,
        role: typedUser.role,
        createdAt: typedUser.createdAt,
      },
    });

    // Set refresh token in HTTP-only cookie
    return setAuthCookies(response, refreshToken);

  } catch (error) {
    // Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation Error',
          errors: error.issues.map(e => ({
            field: e.path[0],
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('LOGIN ERROR >>>', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Login failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}