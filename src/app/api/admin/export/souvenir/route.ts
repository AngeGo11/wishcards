import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/messages";
import { isAdminAuthenticatedFromToken } from "@/lib/auth";
import { generateSouvenirBookPdf } from "@/lib/export";
import { loadCoverImageServer } from "@/lib/pdf/load-cover-image-server";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!isAdminAuthenticatedFromToken(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const [messages, coverImage] = await Promise.all([
      getMessages(),
      loadCoverImageServer(),
    ]);
    if (messages.length === 0) {
      return NextResponse.json({ error: "Aucun message à exporter" }, { status: 400 });
    }

    const pdf = await generateSouvenirBookPdf(messages, coverImage);
    const filename = `livre-souvenir-retraite-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/export/souvenir:", error);
    return NextResponse.json({ error: "Erreur génération livre souvenir" }, { status: 500 });
  }
}
