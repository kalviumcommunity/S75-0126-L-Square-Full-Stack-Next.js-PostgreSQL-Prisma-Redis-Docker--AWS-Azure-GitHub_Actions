import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/refunds - Get all refund requests with pagination and filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (userId) {
      where.userId = parseInt(userId);
    }
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.refundRequest.count({ where });

    // Get refund requests
    const refunds = await prisma.refundRequest.findMany({
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
        booking: {
          include: {
            schedule: {
              include: {
                route: {
                  include: {
                    operator: {
                      select: {
                        id: true,
                        name: true,
                        cancellationPolicy: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: refunds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refund requests' },
      { status: 500 }
    );
  }
}

// POST /api/refunds - Create a new refund request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, userId, requestedAmount, reason } = body;

    // Validation
    if (!bookingId || !userId || !requestedAmount || !reason) {
      return NextResponse.json(
        { success: false, error: 'All fields (bookingId, userId, requestedAmount, reason) are required' },
        { status: 400 }
      );
    }

    if (requestedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Requested amount must be a positive number' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        refundRequest: true,
        schedule: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking belongs to user
    if (booking.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Booking does not belong to this user' },
        { status: 403 }
      );
    }

    // Check if refund request already exists
    if (booking.refundRequest) {
      return NextResponse.json(
        { success: false, error: 'Refund request already exists for this booking' },
        { status: 409 }
      );
    }

    // Check if booking is cancelled
    if (booking.status !== 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Only cancelled bookings can have refund requests' },
        { status: 400 }
      );
    }

    // Check if requested amount is not more than total price
    if (requestedAmount > booking.totalPrice) {
      return NextResponse.json(
        { success: false, error: 'Requested amount cannot exceed booking total price' },
        { status: 400 }
      );
    }

    // Create refund request and timeline in a transaction
    const refund = await prisma.$transaction(async (tx) => {
      const newRefund = await tx.refundRequest.create({
        data: {
          bookingId,
          userId,
          requestedAmount,
          reason,
          status: 'PENDING'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          booking: {
            include: {
              schedule: {
                include: {
                  route: {
                    include: {
                      operator: {
                        select: {
                          id: true,
                          name: true,
                          cancellationPolicy: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Create timeline entry
      await tx.refundTimeline.create({
        data: {
          refundRequestId: newRefund.id,
          status: 'PENDING',
          notes: 'Refund request created'
        }
      });

      return newRefund;
    });

    return NextResponse.json(
      { success: true, data: refund, message: 'Refund request created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating refund request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create refund request' },
      { status: 500 }
    );
  }
}