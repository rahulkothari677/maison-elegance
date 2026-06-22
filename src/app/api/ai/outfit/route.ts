import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  try {
    const { occasion, products } = await req.json();

    const zai = await ZAI.create();

    const systemPrompt = `You are a luxury fashion stylist at MAISON ÉLÉGANCE. The user describes an occasion and you must recommend a COMPLETE OUTFIT from the product catalog.

Here is the catalog:
${products.map((p: any, i: number) => `[${i}] ${p.name} ($${p.price}) — ${p.shortDescription}. Category: ${p.category}. Colors: ${p.colors.map((c: any) => c.name).join(", ")}.`).join("\n")}

The user's occasion is: "${occasion}"

Respond in EXACTLY this JSON format (no markdown, no explanation before or after):
{
  "title": "A short name for this look (e.g., 'Florentine Evening')",
  "description": "1-2 sentences explaining why this outfit works for the occasion",
  "items": [
    { "index": 0, "reason": "Why this piece works" }
  ]
}

Rules:
- Pick 2-4 items from the catalog that work together as a complete look
- The "index" must be the number from the catalog list above
- Each item must have a "reason" explaining why it's chosen
- The outfit should make sense for the occasion described
- Be creative but practical — real people will wear this`;

    const response = await zai.chat.completions.create({
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.8,
      max_tokens: 600,
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse JSON from response (strip any markdown fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not generate outfit. Please try again." }, { status: 500 });
    }

    const outfit = JSON.parse(jsonMatch[0]);

    // Map indices to actual product data
    const outfitProducts = outfit.items.map((item: any) => ({
      ...products[item.index],
      reason: item.reason,
    }));

    return NextResponse.json({
      title: outfit.title,
      description: outfit.description,
      products: outfitProducts,
    });
  } catch (error: any) {
    console.error("AI Outfit error:", error);
    return NextResponse.json(
      { error: "Could not generate outfit. Please try again." },
      { status: 500 }
    );
  }
}
