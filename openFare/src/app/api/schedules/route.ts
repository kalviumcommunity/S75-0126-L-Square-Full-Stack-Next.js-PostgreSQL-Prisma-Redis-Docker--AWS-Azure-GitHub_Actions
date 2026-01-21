import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createScheduleSchema } from '@/lib/schemas/scheduleSchema';
import { ZodError } from 'zod';

// GET /api/schedules - Get all schedules with pagination and filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const routeId = searchParams.get('routeId');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const skip = (page - 1) * limit;

    // Build filter
    const where: {
      routeId?: number;
      departureTime?: { gte: Date; lt: Date };
      availableSeats?: { gt: number };
    } = {};
    if (routeId) where.routeId = parseInt(routeId);
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.departureTime = { gte: startDate, lt: endDate };
    }
    if (availableOnly) where.availableSeats = { gt: 0 };

    // Get total count
    const total = await prisma.schedule.count({ where });

    // Get schedules
    const schedules = await prisma.schedule.findMany({
      where,
      skip,
      take: limit,
      include: {
        route: {
          include: {
            operator: {
              select: { id: true, name: true, cancellationPolicy: true },
            },
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { departureTime: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST /api/schedules - Create a new schedule
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Zod validation
    const validatedData = createScheduleSchema.parse(body);
    const { routeId, departureTime, arrivalTime, price, availableSeats } = validatedData;

    // Check if route exists
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) {
      return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
    }

    // Create schedule
    const schedule = await prisma.schedule.create({
      data: {
        routeId,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        price,
        availableSeats,
      },
      include: {
        route: {
          include: {
            operator: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation Error',
        errors: error.issues.map(e => ({
          field: e.path[0],
          message: e.message,
        })),
      }, { status: 400 });
    }

    console.error('Error creating schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to create schedule' }, { status: 500 });
  }
}
