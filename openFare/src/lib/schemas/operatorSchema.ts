import { z } from "zod";

export const createOperatorSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5),
  cancellationPolicy: z.string().min(1),
});

export const updateOperatorSchema = createOperatorSchema.partial();
