import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/routes - Get all routes with pagination and filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const operatorId = searchParams.get('operatorId');
    const skip = (page - 1) * limit;

    // Build filter
    const where: Record<string, { contains: string; mode: string } | number> = {};
    if (origin) where.origin = { contains: origin, mode: 'insensitive' };
    if (destination) where.destination = { contains: destination, mode: 'insensitive' };
    if (operatorId) where.operatorId = parseInt(operatorId);

    const total = await prisma.route.count({ where });

    const routes = await prisma.route.findMany({
      where,
      skip,
      take: limit,
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            contactPhone: true,
            cancellationPolicy: true
          }
        },
        _count: { select: { schedules: true } }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: routes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch routes' }, { status: 500 });
  }
}

// POST /api/routes - Create a new route
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, distance, operatorId } = body;

    if (!origin || !destination || !distance || !operatorId) {
      return NextResponse.json(
        { success: false, error: 'All fields (origin, destination, distance, operatorId) are required' },
        { status: 400 }
      );
    }

    if (typeof distance !== 'number' || distance <= 0) {
      return NextResponse.json(
        { success: false, error: 'Distance must be a positive number' },
        { status: 400 }
      );
    }

    const operator = await prisma.busOperator.findUnique({ where: { id: operatorId } });
    if (!operator) return NextResponse.json({ success: false, error: 'Operator not found' }, { status: 404 });

    const route = await prisma.route.create({
      data: { origin, destination, distance, operatorId },
      include: {
        operator: { select: { id: true, name: true, contactPhone: true } }
      }
    });

    return NextResponse.json({ success: true, data: route, message: 'Route created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json({ success: false, error: 'Failed to create route' }, { status: 500 });
  }
}
