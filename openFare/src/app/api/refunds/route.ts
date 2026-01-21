import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { RefundStatus } from '@prisma/client';

// GET /api/refunds - Get all refund requests
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: { userId?: number; status?: RefundStatus } = {};
    if (userId) where.userId = Number(userId);
    if (status) where.status = status as RefundStatus; // Cast to match RefundStatus enum

    const total = await prisma.refundRequest.count({ where });

    const refunds = await prisma.refundRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { requestedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
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
      }
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

// POST /api/refunds - Create refund request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, userId, requestedAmount, reason } = body;

    if (!bookingId || !userId || !requestedAmount || !reason) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (requestedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Requested amount must be positive' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        refundRequest: true
      }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    if (booking.refundRequest) {
      return NextResponse.json(
        { success: false, error: 'Refund already requested' },
        { status: 409 }
      );
    }

    if (booking.status !== 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Only cancelled bookings can be refunded' },
        { status: 400 }
      );
    }

    if (requestedAmount > booking.totalPrice) {
      return NextResponse.json(
        { success: false, error: 'Requested amount exceeds total price' },
        { status: 400 }
      );
    }

    const refund = await prisma.$transaction(async (tx) => {
      const created = await tx.refundRequest.create({
        data: {
          bookingId,
          userId,
          requestedAmount,
          reason,
          status: 'PENDING'
        }
      });

      await tx.refundTimeline.create({
        data: {
          refundRequestId: created.id,
          status: 'PENDING',
          notes: 'Refund request created'
        }
      });

      return created;
    });

    return NextResponse.json(
      { success: true, data: refund, message: 'Refund request created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create refund request' },
      { status: 500 }
    );
  }
}
