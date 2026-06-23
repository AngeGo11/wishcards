import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/messages";
import { isAdminAuthenticatedFromToken } from "@/lib/auth";
import { generateCsv } from "@/lib/export";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!isAdminAuthenticatedFromToken(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const messages = await getMessages();
    const csv = generateCsv(messages);
    const filename = `livre-or-messages-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/export/csv:", error);
    return NextResponse.json({ error: "Erreur export CSV" }, { status: 500 });
  }
}
