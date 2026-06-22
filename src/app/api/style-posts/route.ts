import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";

export async function GET() {
  const posts = await db.stylePost.findMany({
    include: { comments: true, product: { select: { name: true, slug: true, images: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      product: p.product
        ? { ...p.product, images: JSON.parse(p.product.images) }
        : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const user = session.user as any;
  const post = await db.stylePost.create({
    data: {
      userId: user.id,
      authorName: sanitizeInput(user.name || "Anonymous"),
      authorAvatar: user.image || null,
      image: body.image,
      caption: sanitizeInput(body.caption),
      productId: body.productId || null,
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
