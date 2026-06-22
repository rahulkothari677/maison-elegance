import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = [
  "Processing",
  "Confirmed",
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

  const data: any = {};
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

  // Broadcast status update via socket.io (if running)
  // The mini-service listens for HTTP webhook calls on port 3004
  try {
    await fetch("http://127.0.0.1:3004/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "order:status-changed",
        room: `order:${order.orderNumber}`,
        payload: {
          orderNumber: order.orderNumber,
          status: order.status,
          trackingNumber: order.trackingNumber,
          customerEmail: order.user?.email || order.guestEmail,
        },
      }),
    });
  } catch (e) {
    // Socket service may not be running — non-fatal
    console.log("Socket service not available, skipping broadcast");
  }

  return NextResponse.json({
    order: {
      ...order,
      customer: order.user
        ? { name: order.user.name, email: order.user.email }
        : { name: "Guest", email: order.guestEmail },
    },
  });
}
