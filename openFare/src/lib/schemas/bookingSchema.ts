import { z } from "zod";

export const createBookingSchema = z.object({
  userId: z.number().int().positive(),
  scheduleId: z.number().int().positive(),
  seatNumber: z.string().min(1)
});

export const updateBookingSchema = z.object({
  seatNumber: z.string().min(1)
});
