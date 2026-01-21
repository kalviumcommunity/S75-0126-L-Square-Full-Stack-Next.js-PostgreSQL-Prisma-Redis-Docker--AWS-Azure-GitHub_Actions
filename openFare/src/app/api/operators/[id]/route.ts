import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOperatorSchema } from "@/lib/schemas/operatorSchema";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid operator ID" },
      { status: 400 }
    );
  }

  const operator = await prisma.busOperator.findUnique({
    where: { id },
    include: {
      routes: {
        include: {
          schedules: {
            take: 5,
            orderBy: { departureTime: "asc" },
          },
        },
      },
      _count: { select: { routes: true } },
    },
  });

  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Operator not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: operator });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid operator ID" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const data = updateOperatorSchema.parse(body);

  const operator = await prisma.busOperator.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    success: true,
    data: operator,
    message: "Operator updated successfully",
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid operator ID" },
      { status: 400 }
    );
  }

  const operator = await prisma.busOperator.findUnique({
    where: { id },
    include: { _count: { select: { routes: true } } },
  });

  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Operator not found" },
      { status: 404 }
    );
  }

  if (operator._count.routes > 0) {
    return NextResponse.json(
      { success: false, error: "Cannot delete operator with routes" },
      { status: 409 }
    );
  }

  await prisma.busOperator.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    message: "Operator deleted successfully",
  });
}
