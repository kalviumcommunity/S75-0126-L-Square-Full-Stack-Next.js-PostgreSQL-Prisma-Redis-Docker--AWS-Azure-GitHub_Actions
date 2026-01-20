import { NextResponse } from "next/server";
// import { prisma } from "@lib/prisma";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, productId } = await req.json();

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Fetch product
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.stock <= 0) {
        throw new Error("Product out of stock");
      }

      // 2. Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          productId,
          total: 1000,
        },
      });

      // 3. Update stock
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: { decrement: 1 },
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Transaction failed. Rolled back.",
        error: error.message,
      },
      { status: 400 }
    );
  }
}


export async function GET() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      total: true,
      createdAt: true,
      userId: true,
      productId: true,
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(orders);
}