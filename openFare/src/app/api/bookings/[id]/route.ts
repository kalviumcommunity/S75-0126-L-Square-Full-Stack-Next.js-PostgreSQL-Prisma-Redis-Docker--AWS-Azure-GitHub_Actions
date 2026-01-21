import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBookingSchema } from "@/lib/schemas/bookingSchema";

/**
 * GET /api/bookings/[id]
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      schedule: { include: { route: { include: { operator: true } } } },
      refundRequest: { include: { timeline: true } }
    }
  });

  if (!booking) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: booking });
}

/**
 * PUT /api/bookings/[id]
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = updateBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.issues },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { success: false, error: "Booking not editable" },
      { status: 400 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: parsed.data
  });

  return NextResponse.json({ success: true, data: updated });
}
