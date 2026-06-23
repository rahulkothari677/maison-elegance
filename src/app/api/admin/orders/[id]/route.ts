import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = [
  "Processing",
  "Confirmed",
  "Paid",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Valid: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Try Prisma first
    try {
      const data: any = { updatedAt: new Date() };
      if (body.status) data.status = body.status;
      if (body.trackingNumber !== undefined)
        data.trackingNumber = body.trackingNumber;

      const order = await db.order.update({
        where: { id },
        data,
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
      });

      return NextResponse.json({
        order: {
          ...order,
          customer: order.user
            ? { name: order.user.name, email: order.user.email }
            : { name: "Guest", email: order.guestEmail },
        },
      });
    } catch (prismaErr: any) {
      // Prisma failed — fall back to raw SQL
      console.warn("[admin/orders/[id]] Prisma update failed, using raw SQL:", prismaErr?.message);

      const updates: string[] = ['"updatedAt" = CURRENT_TIMESTAMP'];
      const values: any[] = [];
      let paramIdx = 1;

      if (body.status) {
        updates.push(`"status" = $${paramIdx++}`);
        values.push(body.status);
      }
      if (body.trackingNumber !== undefined) {
        updates.push(`"trackingNumber" = $${paramIdx++}`);
        values.push(body.trackingNumber);
      }
      values.push(id);

      await db.$executeRawUnsafe(
        `UPDATE "Order" SET ${updates.join(", ")} WHERE "id" = $${paramIdx}`,
        ...values
      );

      // Fetch the updated order
      const rows = await db.$queryRawUnsafe(
        `SELECT * FROM "Order" WHERE "id" = $1`,
        id
      );
      const order = (rows as any[])[0];

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Fetch items
      const items = await db.$queryRawUnsafe(
        `SELECT * FROM "OrderItem" WHERE "orderId" = $1`,
        id
      );

      return NextResponse.json({
        order: {
          ...order,
          customer: { name: "Guest", email: order.guestEmail },
          items: items,
        },
      });
    }
  } catch (error: any) {
    console.error("[admin/orders/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
