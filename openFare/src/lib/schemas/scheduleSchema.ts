import { z } from 'zod';

// Schema for creating a schedule
export const createScheduleSchema = z.object({
  routeId: z.number().int().positive(),
  departureTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid departure time format' }),
  arrivalTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid arrival time format' }),
  price: z.number().positive('Price must be greater than 0'),
  availableSeats: z.number().int().positive('Available seats must be greater than 0'),
}).strict();

// Schema for updating a schedule
export const updateScheduleSchema = z.object({
  departureTime: z.string().optional().refine((val) => val ? !isNaN(Date.parse(val)) : true, { message: 'Invalid departure time format' }),
  arrivalTime: z.string().optional().refine((val) => val ? !isNaN(Date.parse(val)) : true, { message: 'Invalid arrival time format' }),
  price: z.number().positive('Price must be greater than 0').optional(),
  availableSeats: z.number().int().positive('Available seats must be greater than 0').optional(),
});
