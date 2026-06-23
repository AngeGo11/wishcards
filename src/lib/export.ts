import { jsPDF } from "jspdf";
import type { Message } from "./types";

export { generateSouvenirBookPdf } from "./pdf/souvenir-book";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export function generateMessagesPdf(messages: Message[], title?: string): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title ?? "Export des messages", margin, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${messages.length} message(s) — ${new Date().toLocaleDateString("fr-FR")}`, margin, y);
  y += 10;
  doc.setTextColor(0);

  for (const msg of messages) {
    const header = `${msg.emoji ? msg.emoji + " " : ""}${msg.name}${msg.signature ? ` — ${msg.signature}` : ""}`;
    const dateLine = formatDate(msg.created_at);
    const bodyLines = wrapText(doc, msg.message, contentWidth);
    const blockHeight = 8 + bodyLines.length * 5 + 6;

    if (y + blockHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(header, margin, y);
    y += 5;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(dateLine, margin, y);
    y += 6;
    doc.setTextColor(0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const line of bodyLines) {
      doc.text(line, margin, y);
      y += 5;
    }

    y += 8;
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  return doc.output("arraybuffer");
}

export function generateCsv(messages: Message[]): string {
  const header = ["id", "nom", "message", "signature", "emoji", "date"];
  const rows = messages.map((m) => [
    String(m.id),
    escapeCsv(m.name),
    escapeCsv(m.message),
    escapeCsv(m.signature ?? ""),
    escapeCsv(m.emoji ?? ""),
    formatDate(m.created_at),
  ]);

  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
