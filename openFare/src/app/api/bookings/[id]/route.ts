import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        schedule: {
          include: {
            route: {
              include: {
                operator: true
              }
            }
          }
        },
        refundRequest: {
          include: {
            timeline: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking (limited fields)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { seatNumber } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { schedule: true }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow updates if booking is confirmed
    if (existingBooking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { success: false, error: 'Can only update confirmed bookings' },
        { status: 400 }
      );
    }

    // If changing seat number, check if new seat is available
    if (seatNumber && seatNumber !== existingBooking.seatNumber) {
      const seatTaken = await prisma.booking.findFirst({
        where: {
          scheduleId: existingBooking.scheduleId,
          seatNumber,
          status: 'CONFIRMED',
          id: { not: id }
        }
      });

      if (seatTaken) {
        return NextResponse.json(
          { success: false, error: 'This seat is already booked' },
          { status: 409 }
        );
      }
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...(seatNumber && { seatNumber })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        schedule: {
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
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete booking (admin only, use cancel endpoint instead)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        refundRequest: true
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow deletion if booking has no refund request
    if (existingBooking.refundRequest) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete booking with refund request. Cancel the refund first.' },
        { status: 409 }
      );
    }

    // Delete booking
    await prisma.booking.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}