import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const questions = await db.question.findMany({
    where: { productId: product.id },
    include: { answers: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ questions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const user = session.user as any;
  const question = await db.question.create({
    data: {
      productId: product.id,
      userId: user.id,
      authorName: user.name || "Anonymous",
      body: body.body,
    },
  });
  return NextResponse.json({ question }, { status: 201 });
}
