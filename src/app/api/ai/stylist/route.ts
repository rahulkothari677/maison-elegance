import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, products } = await req.json();

    const zai = await ZAI.create();

    const systemPrompt = `You are Camille Dubois, the personal stylist at MAISON ÉLÉGANCE — a premium clothing brand. You help customers with styling advice, product recommendations, fit questions, and fashion guidance.

Here is our current product catalog. Reference these when making recommendations:

${products.map((p: any) => `- ${p.name} ($${p.price}): ${p.shortDescription}. Colors: ${p.colors.map((c: any) => c.name).join(", ")}. Sizes: ${p.sizes.join(", ")}. Category: ${p.category}.`).join("\n")}

Guidelines:
- Be warm, sophisticated, and genuinely helpful — like a knowledgeable friend who happens to be a fashion expert
- Keep responses concise (2-4 sentences for simple questions, up to 6 for outfit recommendations)
- When recommending products, mention the product name and key selling points
- If asked about fit/sizing, give practical advice based on the product info
- If the user asks about something not in our catalog, acknowledge and suggest the closest alternative
- Use the customer's name if they mention it
- Be proactive — if they ask about a coat, suggest what to pair it with
- Never mention you are an AI — you are Camille, a personal stylist`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).map((m: any) => ({
        role: m.role,
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const response = await zai.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content || "I apologize, I didn't catch that. Could you rephrase?";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Stylist error:", error);
    return NextResponse.json(
      { reply: "I apologize, I'm having trouble connecting right now. Please try again in a moment." },
      { status: 200 }
    );
  }
}
