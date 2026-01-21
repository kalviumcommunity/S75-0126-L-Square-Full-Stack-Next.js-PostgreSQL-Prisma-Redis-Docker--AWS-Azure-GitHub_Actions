import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { UserRole } from '@prisma/client';
import { createUserSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = createUserSchema.parse(body);
    const { name, email, phone, role } = validatedData;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: (role || 'PASSENGER') as UserRole,
      },
    });

    return NextResponse.json(
      { success: true, data: user, message: 'User created successfully' },
      { status: 201 }
    );

  } catch (err: unknown) {
    // Make sure we type the error as unknown, then narrow it
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation Error',
          errors: err.issues.map(e => ({
            field: e.path[0],
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Prisma unique constraint
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    console.error('CREATE USER ERROR >>>', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}