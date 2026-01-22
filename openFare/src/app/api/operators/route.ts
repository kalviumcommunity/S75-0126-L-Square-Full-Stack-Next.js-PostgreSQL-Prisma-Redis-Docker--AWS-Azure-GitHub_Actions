import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOperatorSchema } from "@/lib/schemas/operatorSchema";
import { handleError, DatabaseError, ValidationError } from "@/lib/errorHandler";
import { sendSuccess } from "@/lib/responseHandler";

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

    return sendSuccess(operators, "Operators fetched successfully", 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error, "GET /api/operators");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    let data;
    try {
      data = createOperatorSchema.parse(body);
    } catch (validationError) {
      throw new ValidationError("Invalid operator data provided");
    }

    const operator = await prisma.busOperator.create({ data });

    return sendSuccess(operator, "Operator created successfully", 201);
  } catch (error) {
    return handleError(error, "POST /api/operators");
  }
}
