import { NextResponse } from 'next/server';
// import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';


// GET /api/users - Get all users with pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const role = searchParams.get('role');
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (role) {
      where.role = role;
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: true, refundRequests: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, role } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: role || 'PASSENGER'
      }
    });

    return NextResponse.json(
      { success: true, data: user, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
  console.error('CREATE USER ERROR >>>', error);

  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : error,
    },
    { status: 500 }
  );
}

}