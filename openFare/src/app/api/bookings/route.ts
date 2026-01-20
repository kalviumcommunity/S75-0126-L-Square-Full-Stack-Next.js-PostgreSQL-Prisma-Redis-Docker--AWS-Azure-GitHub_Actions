import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate unique booking number
function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BKG-${timestamp}-${random}`.toUpperCase();
}

// GET /api/bookings - Get all bookings with pagination and filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const bookingNumber = searchParams.get('bookingNumber');
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (userId) {
      where.userId = parseInt(userId);
    }
    if (status) {
      where.status = status;
    }
    if (bookingNumber) {
      where.bookingNumber = { contains: bookingNumber, mode: 'insensitive' };
    }

    // Get total count
    const total = await prisma.booking.count({ where });

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
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
                operator: {
                  select: {
                    id: true,
                    name: true,
                    contactPhone: true
                  }
                }
              }
            }
          }
        },
        refundRequest: true
      },
      orderBy: { bookedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, scheduleId, seatNumber } = body;

    // Validation
    if (!userId || !scheduleId || !seatNumber) {
      return NextResponse.json(
        { success: false, error: 'userId, scheduleId, and seatNumber are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if schedule exists and has available seats
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        route: {
          include: {
            operator: true
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

    if (schedule.availableSeats <= 0) {
      return NextResponse.json(
        { success: false, error: 'No seats available for this schedule' },
        { status: 400 }
      );
    }

    // Check if seat is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        scheduleId,
        seatNumber,
        status: { in: ['CONFIRMED'] }
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'This seat is already booked' },
        { status: 409 }
      );
    }

    // Create booking and update available seats in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber: generateBookingNumber(),
          userId,
          scheduleId,
          seatNumber,
          totalPrice: schedule.price,
          status: 'CONFIRMED'
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

      // Decrease available seats
      await tx.schedule.update({
        where: { id: scheduleId },
        data: {
          availableSeats: { decrement: 1 }
        }
      });

      return newBooking;
    });

    return NextResponse.json(
      { success: true, data: booking, message: 'Booking created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}