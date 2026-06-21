import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE - remove from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;
  const { productId } = await params; // this is the slug

  const product = await db.product.findUnique({ where: { slug: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await db.wishlistItem.deleteMany({
    where: { userId: user.id, productId: product.id },
  });

  return NextResponse.json({ success: true });
}
