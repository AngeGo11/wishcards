import { NextResponse } from "next/server";
import { getMessages, getMessageCount } from "@/lib/messages";

export async function GET() {
  try {
    const [messages, count] = await Promise.all([getMessages(), getMessageCount()]);
    return NextResponse.json({ messages, count });
  } catch (error) {
    console.error("GET /api/messages:", error);
    return NextResponse.json(
      { error: "Impossible de charger les messages" },
      { status: 500 }
    );
  }
}
