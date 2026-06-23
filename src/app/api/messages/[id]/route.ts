import { NextRequest, NextResponse } from "next/server";
import { deleteMessage } from "@/lib/messages";
import { isAdminAuthenticatedFromToken } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("admin_session")?.value;
  if (!isAdminAuthenticatedFromToken(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const messageId = Number(id);

  if (!messageId || Number.isNaN(messageId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const deleted = await deleteMessage(messageId);
    if (!deleted) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/messages:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
