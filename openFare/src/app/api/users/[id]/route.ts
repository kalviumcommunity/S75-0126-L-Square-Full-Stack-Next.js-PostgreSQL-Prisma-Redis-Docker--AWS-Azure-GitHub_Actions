import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateUserSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

// GET /api/users/[id] - Get user by ID
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          take: 10,
          orderBy: { bookedAt: 'desc' },
          include: { schedule: { include: { route: true } } }
        },
        refundRequests: { take: 10, orderBy: { requestedAt: 'desc' } },
        _count: { select: { bookings: true, refundRequests: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await req.json();

    // ✅ Zod validation
    const validatedData = updateUserSchema.parse(body);
    const { name, email, phone, role } = validatedData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Update user
    const updateData: Record<string, string | undefined> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating user:', error);

    // ✅ Zod validation error
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation Error',
          errors: error.issues?.map((e: ZodError['issues'][number]) => ({
            field: e.path[0],
            message: e.message
          })) || []
        },
        { status: 400 }
      );
    }

    // ✅ Prisma unique constraint error
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 });
    }

    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true, refundRequests: true } } }
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion if bookings or refund requests exist
    if (existingUser._count.bookings > 0 || existingUser._count.refundRequests > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete user with existing bookings or refund requests' },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
