import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/operators - Get all bus operators with pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.busOperator.count({ where });

    // Get operators
    const operators = await prisma.busOperator.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { routes: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: operators,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching operators:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch operators' },
      { status: 500 }
    );
  }
}

// POST /api/operators - Create a new bus operator
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, licenseNumber, contactEmail, contactPhone, cancellationPolicy } = body;

    // Validation
    if (!name || !licenseNumber || !contactEmail || !contactPhone || !cancellationPolicy) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create operator
    const operator = await prisma.busOperator.create({
      data: {
        name,
        licenseNumber,
        contactEmail,
        contactPhone,
        cancellationPolicy
      }
    });

    return NextResponse.json(
      { success: true, data: operator, message: 'Bus operator created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating operator:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'License number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create operator' },
      { status: 500 }
    );
  }
}