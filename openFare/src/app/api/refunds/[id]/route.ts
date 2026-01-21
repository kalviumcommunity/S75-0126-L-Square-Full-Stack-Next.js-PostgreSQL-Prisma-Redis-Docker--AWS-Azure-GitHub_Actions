import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/refunds/[id]
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid refund ID' }, { status: 400 });
    }

    const refund = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        booking: {
          include: {
            schedule: {
              include: {
                route: { include: { operator: true } }
              }
            }
          }
        },
        timeline: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!refund) {
      return NextResponse.json({ success: false, error: 'Refund not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: refund });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refund' },
      { status: 500 }
    );
  }
}

// PUT /api/refunds/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { processorNotes } = await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid refund ID' }, { status: 400 });
    }

    const refund = await prisma.refundRequest.findUnique({ where: { id } });
    if (!refund) {
      return NextResponse.json({ success: false, error: 'Refund not found' }, { status: 404 });
    }

    const updated = await prisma.refundRequest.update({
      where: { id },
      data: { processorNotes }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Refund updated successfully'
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Failed to update refund' },
      { status: 500 }
    );
  }
}

// DELETE /api/refunds/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid refund ID' }, { status: 400 });
    }

    const refund = await prisma.refundRequest.findUnique({ where: { id } });
    if (!refund) {
      return NextResponse.json({ success: false, error: 'Refund not found' }, { status: 404 });
    }

    if (refund.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Only pending refunds can be deleted' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.refundTimeline.deleteMany({ where: { refundRequestId: id } });
      await tx.refundRequest.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'Refund deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete refund' },
      { status: 500 }
    );
  }
}
