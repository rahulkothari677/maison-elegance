import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, products } = await req.json();

    const zai = await ZAI.create();

    const catalogText = products.map((p: any, i: number) =>
      `[${i}] ${p.name}: ${p.shortDescription}. Category: ${p.category}. Colors: ${p.colors.map((c: any) => c.name).join(", ")}.`
    ).join("\n");

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a fashion expert. Look at this image and find the most similar items from our catalog. Consider the garment type, color, style, and overall aesthetic.

Our catalog:
${catalogText}

Respond in EXACTLY this JSON format (no other text):
{
  "description": "Brief description of what's in the photo (1 sentence)",
  "matches": [
    { "index": 0, "similarity": "high/medium/low", "reason": "Why this matches" }
  ]
}

Pick 3-5 best matches. The "index" must be the number from the catalog list.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });

    const content = response.choices[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not analyze image." }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    const matchedProducts = result.matches.map((m: any) => ({
      ...products[m.index],
      similarity: m.similarity,
      matchReason: m.reason,
    }));

    return NextResponse.json({
      description: result.description,
      products: matchedProducts,
    });
  } catch (error: any) {
    console.error("Visual search error:", error);
    return NextResponse.json(
      { error: "Could not analyze image. Please try a different photo." },
      { status: 500 }
    );
  }
}
