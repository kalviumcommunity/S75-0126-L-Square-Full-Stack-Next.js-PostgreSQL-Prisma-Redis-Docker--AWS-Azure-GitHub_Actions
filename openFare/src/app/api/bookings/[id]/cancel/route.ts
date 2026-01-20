import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/bookings/[id]/cancel - Cancel a booking
export async function POST(
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
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        schedule: true,
        refundRequest: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    // Check if booking is already refunded
    if (booking.status === 'REFUNDED' || booking.status === 'PARTIALLY_REFUNDED') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a refunded booking' },
        { status: 400 }
      );
    }

    // Cancel booking and restore seat in a transaction
    const cancelledBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
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

      // Restore available seat
      await tx.schedule.update({
        where: { id: booking.scheduleId },
        data: {
          availableSeats: { increment: 1 }
        }
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: cancelledBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}