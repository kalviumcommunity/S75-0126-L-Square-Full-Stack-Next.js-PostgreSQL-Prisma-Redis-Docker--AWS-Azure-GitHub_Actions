import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/refunds/[id]/process - Process (approve/reject) a refund request
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { action, approvedAmount, processorNotes } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund request ID' },
        { status: 400 }
      );
    }

    // Validation
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (action === 'approve' && (!approvedAmount || approvedAmount <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Approved amount is required and must be positive for approval' },
        { status: 400 }
      );
    }

    // Check if refund request exists
    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        booking: true
      }
    });

    if (!refundRequest) {
      return NextResponse.json(
        { success: false, error: 'Refund request not found' },
        { status: 404 }
      );
    }

    // Check if refund is pending
    if (refundRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Only pending refund requests can be processed' },
        { status: 400 }
      );
    }

    // Check if approved amount is not more than requested amount
    if (action === 'approve' && approvedAmount > refundRequest.requestedAmount) {
      return NextResponse.json(
        { success: false, error: 'Approved amount cannot exceed requested amount' },
        { status: 400 }
      );
    }

    // Process refund in a transaction
    const processedRefund = await prisma.$transaction(async (tx) => {
      let newStatus: 'APPROVED' | 'REJECTED' | 'PROCESSED';
      let bookingStatus: 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CANCELLED' = 'CANCELLED';

      if (action === 'approve') {
        newStatus = 'APPROVED';
        // Determine if it's full or partial refund
        if (approvedAmount >= refundRequest.booking.totalPrice) {
          bookingStatus = 'REFUNDED';
        } else {
          bookingStatus = 'PARTIALLY_REFUNDED';
        }
      } else {
        newStatus = 'REJECTED';
        bookingStatus = 'CANCELLED';
      }

      // Update refund request
      const updated = await tx.refundRequest.update({
        where: { id },
        data: {
          status: newStatus,
          ...(action === 'approve' && { approvedAmount }),
          processedAt: new Date(),
          processorNotes
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
                          name: true
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

      // Update booking status if approved
      if (action === 'approve') {
        await tx.booking.update({
          where: { id: refundRequest.bookingId },
          data: {
            status: bookingStatus
          }
        });
      }

      // Create timeline entry
      await tx.refundTimeline.create({
        data: {
          refundRequestId: id,
          status: newStatus,
          notes: processorNotes || (action === 'approve' ? `Refund approved: ${approvedAmount}` : 'Refund rejected')
        }
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: processedRefund,
      message: `Refund request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error processing refund request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process refund request' },
      { status: 500 }
    );
  }
}