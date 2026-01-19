import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a bus operator
  const operator = await prisma.busOperator.create({
    data: {
      name: 'Express Travels',
      licenseNumber: 'EXP-2024-001',
      contactEmail: 'contact@expresstravels.com',
      contactPhone: '+91-9876543210',
      cancellationPolicy: 'Full refund if cancelled 24 hours before departure. 50% refund if cancelled 12 hours before.',
    },
  });

  console.log('✅ Created operator:', operator.name);

  // Create a route
  const route = await prisma.route.create({
    data: {
      origin: 'Chennai',
      destination: 'Bangalore',
      distance: 350.5,
      operatorId: operator.id,
    },
  });

  console.log('✅ Created route:', `${route.origin} → ${route.destination}`);

  // Create a schedule
  const schedule = await prisma.schedule.create({
    data: {
      routeId: route.id,
      departureTime: new Date('2026-01-15T06:00:00'),
      arrivalTime: new Date('2026-01-15T12:00:00'),
      price: 800,
      availableSeats: 40,
    },
  });

  console.log('✅ Created schedule:', `Departure: ${schedule.departureTime}`);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+91-9876543211',
      role: 'PASSENGER',
    },
  });

  console.log('✅ Created user:', user.name);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });