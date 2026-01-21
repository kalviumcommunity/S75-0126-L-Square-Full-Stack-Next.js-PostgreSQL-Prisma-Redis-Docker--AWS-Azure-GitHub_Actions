import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/orders
 * Create order using transaction (no products)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, total } = body;

    // Validation
    if (!userId || !total || total <= 0) {
      return NextResponse.json(
        { success: false, message: "userId and valid total are required" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      // Check user
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

    
      const newOrderData = {
        id: Math.floor(Math.random() * 1000000), // Placeholder ID
        userId,
        total,
        createdAt: new Date(),
      };
      
      return newOrderData;
    });

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("Order transaction failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Transaction failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}

/**
 * GET /api/orders
 * Fetch latest orders
 */
export async function GET() {
  try {
    // Since there's no Order model in the schema, we'll return placeholder data
    // Or potentially return bookings if that's what represents orders in this system
    const orders = [
      {
        id: 1,
        total: 50.00,
        createdAt: new Date().toISOString(),
        userId: 1,
      },
      {
        id: 2,
        total: 75.50,
        createdAt: new Date().toISOString(),
        userId: 2,
      },
    ];

    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error("Failed to fetch orders:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
