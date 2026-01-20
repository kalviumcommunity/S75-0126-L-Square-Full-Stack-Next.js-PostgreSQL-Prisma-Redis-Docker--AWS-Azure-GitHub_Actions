import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/refunds/[id] - Get refund request by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund request ID' },
        { status: 400 }
      );
    }

    const refund = await prisma.refundRequest.findUnique({
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
        booking: {
          include: {
            schedule: {
              include: {
                route: {
                  include: {
                    operator: true
                  }
                }
              }
            }
          }
        },
        timeline: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!refund) {
      return NextResponse.json(
        { success: false, error: 'Refund request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: refund });
  } catch (error) {
    console.error('Error fetching refund request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refund request' },
      { status: 500 }
    );
  }
}

// PUT /api/refunds/[id] - Update refund request (admin only - for notes/status)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { processorNotes } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund request ID' },
        { status: 400 }
      );
    }

    // Check if refund request exists
    const existingRefund = await prisma.refundRequest.findUnique({
      where: { id }
    });

    if (!existingRefund) {
      return NextResponse.json(
        { success: false, error: 'Refund request not found' },
        { status: 404 }
      );
    }

    // Only allow updating processor notes
    const updatedRefund = await prisma.refundRequest.update({
      where: { id },
      data: {
        ...(processorNotes && { processorNotes })
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
        },
        timeline: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRefund,
      message: 'Refund request updated successfully'
    });
  } catch (error) {
    console.error('Error updating refund request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update refund request' },
      { status: 500 }
    );
  }
}

// DELETE /api/refunds/[id] - Delete refund request
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund request ID' },
        { status: 400 }
      );
    }

    // Check if refund request exists
    const existingRefund = await prisma.refundRequest.findUnique({
      where: { id }
    });

    if (!existingRefund) {
      return NextResponse.json(
        { success: false, error: 'Refund request not found' },
        { status: 404 }
      );
    }

    // Only allow deletion if status is PENDING
    if (existingRefund.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Can only delete pending refund requests' },
        { status: 400 }
      );
    }

    // Delete refund request and timeline in transaction
    await prisma.$transaction(async (tx) => {
      // Delete timeline entries first
      await tx.refundTimeline.deleteMany({
        where: { refundRequestId: id }
      });

      // Delete refund request
      await tx.refundRequest.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Refund request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting refund request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete refund request' },
      { status: 500 }
    );
  }
}