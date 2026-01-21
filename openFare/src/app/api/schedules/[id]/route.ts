import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { updateScheduleSchema } from '@/lib/schemas/scheduleSchema';
import { updateScheduleSchema } from '@/lib/schemas/scheduleSchema';

import { ZodError } from 'zod';

// GET /api/schedules/[id] - Get schedule by ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid schedule ID' }, { status: 400 });

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        route: { include: { operator: true } },
        bookings: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (!schedule) return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

// PUT /api/schedules/[id] - Update schedule
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid schedule ID' }, { status: 400 });

    const body = await req.json();

    // ✅ Zod validation
    const validatedData = updateScheduleSchema.parse(body);
    const { departureTime, arrivalTime, price, availableSeats } = validatedData;

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({ where: { id } });
    if (!existingSchedule) return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });

    // Validate times if both are provided
    if (departureTime && arrivalTime && new Date(arrivalTime) <= new Date(departureTime)) {
      return NextResponse.json({ success: false, error: 'Arrival time must be after departure time' }, { status: 400 });
    }

    // Update schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        ...(departureTime && { departureTime: new Date(departureTime) }),
        ...(arrivalTime && { arrivalTime: new Date(arrivalTime) }),
        ...(price !== undefined && { price }),
        ...(availableSeats !== undefined && { availableSeats }),
      },
      include: {
        route: { include: { operator: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: updatedSchedule, message: 'Schedule updated successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation Error',
        errors: error.issues.map(e => ({ field: e.path[0], message: e.message })),
      }, { status: 400 });
    }

    console.error('Error updating schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to update schedule' }, { status: 500 });
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid schedule ID' }, { status: 400 });

    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existingSchedule) return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });

    if (existingSchedule._count.bookings > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete schedule with existing bookings' }, { status: 409 });
    }

    await prisma.schedule.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete schedule' }, { status: 500 });
  }
}
