import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { UserRole } from '@prisma/client';
import { createUserSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';
import { cacheHelper } from '@/lib/redis';

const CACHE_KEY = 'users:list';
const CACHE_TTL = 60; // 60 seconds

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

    // Invalidate cache after creating a new user
    await cacheHelper.del(CACHE_KEY);
    console.log('Cache invalidated after user creation');

    return NextResponse.json(
      { success: true, data: user, message: 'User created successfully' },
      { status: 201 }
    );

  } catch (err: unknown) {
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
    // Try to get from cache first
    const cachedUsers = await cacheHelper.get(CACHE_KEY);
    
    if (cachedUsers) {
      console.log('✅ Cache HIT - Serving users from Redis');
      return NextResponse.json({
        success: true,
        data: cachedUsers,
        source: 'cache',
      });
    }

    console.log('❌ Cache MISS - Fetching users from database');
    
    // Fetch from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    // Store in cache for 60 seconds
    await cacheHelper.set(CACHE_KEY, users, CACHE_TTL);
    console.log(`📦 Cached ${users.length} users for ${CACHE_TTL} seconds`);

    return NextResponse.json({
      success: true,
      data: users,
      source: 'database',
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}