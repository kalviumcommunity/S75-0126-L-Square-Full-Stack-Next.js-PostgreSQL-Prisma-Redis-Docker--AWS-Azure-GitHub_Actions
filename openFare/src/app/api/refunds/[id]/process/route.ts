import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/refunds/[id]/process
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { action, approvedAmount, processorNotes } = await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid refund ID' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be approve or reject' },
        { status: 400 }
      );
    }

    const refund = await prisma.refundRequest.findUnique({
      where: { id },
      include: { booking: true }
    });

    if (!refund) {
      return NextResponse.json({ success: false, error: 'Refund not found' }, { status: 404 });
    }

    if (refund.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Only pending refunds can be processed' },
        { status: 400 }
      );
    }

    if (action === 'approve' && approvedAmount > refund.requestedAmount) {
      return NextResponse.json(
        { success: false, error: 'Approved amount exceeds requested amount' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

      const updated = await tx.refundRequest.update({
        where: { id },
        data: {
          status,
          approvedAmount: action === 'approve' ? approvedAmount : undefined,
          processorNotes,
          processedAt: new Date()
        }
      });

      await tx.refundTimeline.create({
        data: {
          refundRequestId: id,
          status,
          notes: processorNotes
        }
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Refund ${action}d successfully`
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
