import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const user = session.user as any;
  const answer = await db.answer.create({
    data: {
      questionId: id,
      userId: user.id,
      authorName: user.name || "Anonymous",
      body: body.body,
      isVerified: false,
    },
  });
  return NextResponse.json({ answer }, { status: 201 });
}
