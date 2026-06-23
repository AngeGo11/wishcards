import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/messages";
import { isAdminAuthenticatedFromToken } from "@/lib/auth";
import { generateMessagesPdf } from "@/lib/export";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!isAdminAuthenticatedFromToken(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const messages = await getMessages();
    const pdf = generateMessagesPdf(messages, "Livre d'Or — Export des messages");
    const filename = `livre-or-export-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/export/pdf:", error);
    return NextResponse.json({ error: "Erreur export PDF" }, { status: 500 });
  }
}
