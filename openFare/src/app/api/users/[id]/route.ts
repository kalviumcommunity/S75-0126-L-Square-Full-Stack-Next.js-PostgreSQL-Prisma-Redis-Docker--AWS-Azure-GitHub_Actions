import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheHelper } from '@/lib/redis';

const USERS_CACHE_KEY = 'users:list';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, email, phone } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
    });

    // Invalidate users list cache
    await cacheHelper.del(USERS_CACHE_KEY);
    // Also invalidate this specific user's cache if you implement per-user caching
    await cacheHelper.del(`user:${id}`);
    
    console.log('Cache invalidated after user update');

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('UPDATE USER ERROR >>>', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.user.delete({
      where: { id },
    });

    // Invalidate cache
    await cacheHelper.del(USERS_CACHE_KEY);
    await cacheHelper.del(`user:${id}`);
    
    console.log('Cache invalidated after user deletion');

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('DELETE USER ERROR >>>', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}