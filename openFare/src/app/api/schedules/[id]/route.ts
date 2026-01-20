import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/schedules/[id] - Get schedule by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        route: {
          include: {
            operator: true
          }
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// PUT /api/schedules/[id] - Update schedule
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { departureTime, arrivalTime, price, availableSeats } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({ where: { id } });
    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Validate times if both are provided
    if (departureTime && arrivalTime) {
      const departure = new Date(departureTime);
      const arrival = new Date(arrivalTime);
      if (arrival <= departure) {
        return NextResponse.json(
          { success: false, error: 'Arrival time must be after departure time' },
          { status: 400 }
        );
      }
    }

    // Update schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: {
        ...(departureTime && { departureTime: new Date(departureTime) }),
        ...(arrivalTime && { arrivalTime: new Date(arrivalTime) }),
        ...(price !== undefined && { price }),
        ...(availableSeats !== undefined && { availableSeats })
      },
      include: {
        route: {
          include: {
            operator: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        _count: { select: { bookings: true } }
      }
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Check if schedule has bookings
    if (existingSchedule._count.bookings > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete schedule with existing bookings' },
        { status: 409 }
      );
    }

    // Delete schedule
    await prisma.schedule.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}