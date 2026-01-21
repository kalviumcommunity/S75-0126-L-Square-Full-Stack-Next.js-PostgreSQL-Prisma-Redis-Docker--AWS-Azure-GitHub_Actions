import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOperatorSchema } from "@/lib/schemas/operatorSchema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const where: {
      OR?: Array<{ name?: { contains: string; mode: "insensitive" }; licenseNumber?: { contains: string; mode: "insensitive" } }>
    } = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { licenseNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.busOperator.count({ where });

    const operators = await prisma.busOperator.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { routes: true } } },
    });

    return NextResponse.json({
      success: true,
      data: operators,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching operators:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch operators" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createOperatorSchema.parse(body);

    const operator = await prisma.busOperator.create({ data });

    return NextResponse.json(
      { success: true, data: operator },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "License number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Validation or creation failed" },
      { status: 400 }
    );
  }
}
