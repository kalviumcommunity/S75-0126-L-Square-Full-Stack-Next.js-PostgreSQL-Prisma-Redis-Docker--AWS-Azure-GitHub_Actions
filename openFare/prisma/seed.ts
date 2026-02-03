import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  /* =======================
     BUS OPERATOR
  ======================= */
  const operator = await prisma.busOperator.upsert({
    where: { licenseNumber: 'EXP-2024-001' },
    update: {
      name: 'Express Travels',
      contactEmail: 'contact@expresstravels.com',
      contactPhone: '+91-9876543210',
      cancellationPolicy:
        'Full refund if cancelled 24 hours before departure. 50% refund if cancelled 12 hours before.',
    },
    create: {
      name: 'Express Travels',
      licenseNumber: 'EXP-2024-001',
      contactEmail: 'contact@expresstravels.com',
      contactPhone: '+91-9876543210',
      cancellationPolicy:
        'Full refund if cancelled 24 hours before departure. 50% refund if cancelled 12 hours before.',
    },
  });

  /* =======================
     ROUTE
  ======================= */
  const route = await prisma.route.upsert({
    where: {
      id: 1, // simple approach for seed
    },
    update: {},
    create: {
      origin: 'Chennai',
      destination: 'Bangalore',
      distance: 350.5,
      operatorId: operator.id,
    },
  });

  /* =======================
     SCHEDULE
  ======================= */
  const schedule = await prisma.schedule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      routeId: route.id,
      departureTime: new Date('2026-01-15T06:00:00'),
      arrivalTime: new Date('2026-01-15T12:00:00'),
      price: 800,
      availableSeats: 40,
    },
  });

  /* =======================
     USERS
  ======================= */
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      name: 'Editor User',
      email: 'editor@example.com',
      password: hashedPassword,
      role: 'EDITOR',
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: hashedPassword,
      role: 'VIEWER',
    },
  });

  /* =======================
     BOOKING
  ======================= */
  const booking = await prisma.booking.upsert({
    where: { bookingNumber: 'BK-CHN-BLR-0001' },
    update: {},
    create: {
      bookingNumber: 'BK-CHN-BLR-0001',
      userId: 1, // Assuming admin user is the first user
      scheduleId: schedule.id,
      seatNumber: 'A1',
      totalPrice: schedule.price,
      status: 'CONFIRMED',
    },
  });

  /* =======================
     CANCEL BOOKING
  ======================= */
  const cancelledBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });

  /* =======================
     REFUND REQUEST
  ======================= */
  const refundRequest = await prisma.refundRequest.upsert({
    where: { bookingId: cancelledBooking.id },
    update: {},
    create: {
      bookingId: cancelledBooking.id,
      userId: user.id,
      requestedAmount: cancelledBooking.totalPrice,
      reason: 'Plan changed, cancelling before departure',
      status: 'PENDING',
    },
  });

  /* =======================
     REFUND TIMELINE
  ======================= */
  await prisma.refundTimeline.create({
    data: {
      refundRequestId: refundRequest.id,
      status: 'PENDING',
      notes: 'Refund requested by passenger',
    },
  });

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
