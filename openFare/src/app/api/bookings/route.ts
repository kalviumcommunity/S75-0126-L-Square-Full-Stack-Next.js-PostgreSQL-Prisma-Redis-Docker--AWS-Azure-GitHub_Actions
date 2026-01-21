import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from '@/lib/schemas/bookingSchema';

// booking number generator
function generateBookingNumber(): string {
  return `BKG-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .substring(2, 8)}`.toUpperCase();
}

/**q
 * GET /api/bookings
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const bookings = await prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: { bookedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        schedule: {
          include: {
            route: {
              include: {
                operator: { select: { id: true, name: true } }
              }
            }
          }
        },
        refundRequest: true
      }
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: parsed.error.issues.map((e) => ({
            field: e.path[0],
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { userId, scheduleId, seatNumber } = parsed.data;

    const booking = await prisma.$transaction(async tx => {
      const schedule = await tx.schedule.findUnique({
        where: { id: scheduleId }
      });

      if (!schedule || schedule.availableSeats <= 0) {
        throw new Error("No seats available");
      }

      const seatTaken = await tx.booking.findFirst({
        where: {
          scheduleId: scheduleId,
          seatNumber: seatNumber.toString(),
          status: "CONFIRMED"
        }
      });

      if (seatTaken) {
        throw new Error("Seat already booked");
      }

      const newBooking = await tx.booking.create({
        data: {
          bookingNumber: generateBookingNumber(),
          userId: userId,
          scheduleId: scheduleId,
          seatNumber: seatNumber.toString(),
          totalPrice: schedule.price,
          status: "CONFIRMED"
        }
      });

      await tx.schedule.update({
        where: { id: scheduleId },
        data: { availableSeats: { decrement: 1 } }
      });

      return newBooking;
    });

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}
