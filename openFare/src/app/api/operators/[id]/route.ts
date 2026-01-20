import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/operators/[id] - Get operator by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operator ID' },
        { status: 400 }
      );
    }

    const operator = await prisma.busOperator.findUnique({
      where: { id },
      include: {
        routes: {
          include: {
            schedules: {
              take: 5,
              orderBy: { departureTime: 'asc' }
            }
          }
        },
        _count: {
          select: { routes: true }
        }
      }
    });

    if (!operator) {
      return NextResponse.json(
        { success: false, error: 'Operator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: operator });
  } catch (error) {
    console.error('Error fetching operator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch operator' },
      { status: 500 }
    );
  }
}

// PUT /api/operators/[id] - Update operator
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { name, licenseNumber, contactEmail, contactPhone, cancellationPolicy } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operator ID' },
        { status: 400 }
      );
    }

    // Check if operator exists
    const existingOperator = await prisma.busOperator.findUnique({ where: { id } });
    if (!existingOperator) {
      return NextResponse.json(
        { success: false, error: 'Operator not found' },
        { status: 404 }
      );
    }

    // Update operator
    const updatedOperator = await prisma.busOperator.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(licenseNumber && { licenseNumber }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
        ...(cancellationPolicy && { cancellationPolicy })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedOperator,
      message: 'Operator updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating operator:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'License number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update operator' },
      { status: 500 }
    );
  }
}

// DELETE /api/operators/[id] - Delete operator
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operator ID' },
        { status: 400 }
      );
    }

    // Check if operator exists
    const existingOperator = await prisma.busOperator.findUnique({
      where: { id },
      include: {
        _count: { select: { routes: true } }
      }
    });

    if (!existingOperator) {
      return NextResponse.json(
        { success: false, error: 'Operator not found' },
        { status: 404 }
      );
    }

    // Check if operator has routes
    if (existingOperator._count.routes > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete operator with existing routes' },
        { status: 409 }
      );
    }

    // Delete operator
    await prisma.busOperator.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Operator deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting operator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete operator' },
      { status: 500 }
    );
  }
}