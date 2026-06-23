import { NextRequest, NextResponse } from "next/server";
import { createMessage } from "@/lib/messages";
import { validateMessage } from "@/lib/validation";
import { checkRateLimit, recordSubmission, hashIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateMessage(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { honeypot, ...data } = parsed.data;

    if (honeypot) {
      return NextResponse.json({ success: true, id: 0 });
    }

    const ip = await getClientIp();
    const ipHash = hashIp(ip);
    const { allowed, remaining } = await checkRateLimit(ipHash);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Trop de messages envoyés. Réessayez dans une heure.",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    const id = await createMessage(data, ipHash);
    await recordSubmission(ipHash);

    return NextResponse.json({
      success: true,
      id,
      remaining: remaining - 1,
    });
  } catch (error) {
    console.error("POST /api/messages:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
