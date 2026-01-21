import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id }
  });

  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { success: false, error: "Cannot cancel booking" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async tx => {
    await tx.booking.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() }
    });

    await tx.schedule.update({
      where: { id: booking.scheduleId },
      data: { availableSeats: { increment: 1 } }
    });
  });

  return NextResponse.json({
    success: true,
    message: "Booking cancelled successfully"
  });
}
