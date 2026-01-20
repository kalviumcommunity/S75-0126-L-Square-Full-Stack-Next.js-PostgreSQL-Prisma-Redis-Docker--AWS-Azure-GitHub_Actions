import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/routes/[id] - Get route by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid route ID' },
        { status: 400 }
      );
    }

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        operator: true,
        schedules: {
          orderBy: { departureTime: 'asc' },
          include: {
            _count: {
              select: { bookings: true }
            }
          }
        }
      }
    });

    if (!route) {
      return NextResponse.json(
        { success: false, error: 'Route not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: route });
  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch route' },
      { status: 500 }
    );
  }
}

// PUT /api/routes/[id] - Update route
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { origin, destination, distance, operatorId } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid route ID' },
        { status: 400 }
      );
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({ where: { id } });
    if (!existingRoute) {
      return NextResponse.json(
        { success: false, error: 'Route not found' },
        { status: 404 }
      );
    }

    // If operatorId is provided, check if operator exists
    if (operatorId) {
      const operator = await prisma.busOperator.findUnique({
        where: { id: operatorId }
      });
      if (!operator) {
        return NextResponse.json(
          { success: false, error: 'Operator not found' },
          { status: 404 }
        );
      }
    }

    // Update route
    const updatedRoute = await prisma.route.update({
      where: { id },
      data: {
        ...(origin && { origin }),
        ...(destination && { destination }),
        ...(distance && { distance }),
        ...(operatorId && { operatorId })
      },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            contactPhone: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRoute,
      message: 'Route updated successfully'
    });
  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update route' },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/[id] - Delete route
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid route ID' },
        { status: 400 }
      );
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id },
      include: {
        _count: { select: { schedules: true } }
      }
    });

    if (!existingRoute) {
      return NextResponse.json(
        { success: false, error: 'Route not found' },
        { status: 404 }
      );
    }

    // Check if route has schedules
    if (existingRoute._count.schedules > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete route with existing schedules' },
        { status: 409 }
      );
    }

    // Delete route
    await prisma.route.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}