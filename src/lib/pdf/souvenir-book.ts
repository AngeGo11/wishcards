import { jsPDF } from "jspdf";
import type { Message } from "../types";
import { siteConfig } from "../config";

const COLORS = {
  navy: [26, 39, 74] as [number, number, number],
  gold: [184, 148, 58] as [number, number, number],
  cream: [252, 250, 246] as [number, number, number],
  text: [45, 45, 45] as [number, number, number],
  muted: [120, 115, 105] as [number, number, number],
};

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

function drawGoldLine(doc: jsPDF, y: number, margin: number, pageWidth: number) {
  const [r, g, b] = COLORS.gold;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
}

function drawPageBackground(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const [r, g, b] = COLORS.cream;
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
}

function drawPageFooter(doc: jsPDF, pageNum: number, pageWidth: number, pageHeight: number) {
  const [r, g, b] = COLORS.gold;
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(r, g, b);
  doc.text(String(pageNum), pageWidth / 2, pageHeight - 12, { align: "center" });
}

function getImageFormat(dataUrl: string): "JPEG" | "PNG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

function estimateMessageHeight(
  doc: jsPDF,
  msg: Message,
  contentWidth: number,
  hasPhoto: boolean
): number {
  const bodyLines = wrapText(doc, msg.message, contentWidth - 16);
  let height = 28 + bodyLines.length * 5.5;
  if (msg.signature) height += 6;
  if (msg.emoji) height += 8;
  if (hasPhoto) height += 55;
  return height + 16;
}

function drawMessage(
  doc: jsPDF,
  msg: Message,
  startY: number,
  margin: number,
  contentWidth: number,
  pageWidth: number
): number {
  const [navyR, navyG, navyB] = COLORS.navy;
  const [goldR, goldG, goldB] = COLORS.gold;
  const [mutedR, mutedG, mutedB] = COLORS.muted;
  const [textR, textG, textB] = COLORS.text;

  let y = startY;

  drawGoldLine(doc, y, margin + 8, pageWidth - 8);
  y += 8;

  if (msg.emoji) {
    try {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(textR, textG, textB);
      doc.text(msg.emoji, pageWidth / 2, y, { align: "center" });
      y += 10;
    } catch {
      // Police sans support emoji
    }
  }

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(navyR, navyG, navyB);
  doc.text(msg.name, pageWidth / 2, y, { align: "center" });
  y += 7;

  if (msg.signature) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(mutedR, mutedG, mutedB);
    doc.text(msg.signature, pageWidth / 2, y, { align: "center" });
    y += 6;
  }

  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(mutedR, mutedG, mutedB);
  doc.text(formatDate(msg.created_at), pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(textR, textG, textB);
  const bodyLines = wrapText(doc, `« ${msg.message} »`, contentWidth - 16);
  for (const line of bodyLines) {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 5.5;
  }

  if (msg.photo_url?.startsWith("data:image/")) {
    try {
      const format = getImageFormat(msg.photo_url);
      y += 4;
      const photoWidth = Math.min(contentWidth - 20, 80);
      const photoHeight = 45;
      doc.addImage(
        msg.photo_url,
        format,
        (pageWidth - photoWidth) / 2,
        y,
        photoWidth,
        photoHeight,
        undefined,
        "FAST"
      );
      y += photoHeight + 4;
    } catch {
      // Photo invalide — on continue sans
    }
  }

  y += 4;
  drawGoldLine(doc, y, margin + 8, pageWidth - 8);

  doc.setDrawColor(goldR, goldG, goldB);
  doc.setLineWidth(0.2);

  return y + 10;
}

function drawIntroPage(doc: jsPDF, messageCount: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30;
  const [navyR, navyG, navyB] = COLORS.navy;
  const [goldR, goldG, goldB] = COLORS.gold;
  const [mutedR, mutedG, mutedB] = COLORS.muted;

  drawPageBackground(doc, pageWidth, pageHeight);

  drawGoldLine(doc, 50, margin, pageWidth);
  drawGoldLine(doc, pageHeight - 50, margin, pageWidth);

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(navyR, navyG, navyB);
  doc.text("Messages de vos collègues", pageWidth / 2, 80, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.setTextColor(mutedR, mutedG, mutedB);
  doc.text(
    `Ce livre rassemble ${messageCount} message${messageCount > 1 ? "s" : ""} de gratitude`,
    pageWidth / 2,
    100,
    { align: "center" }
  );
  doc.text(`pour ${siteConfig.retireeName}.`, pageWidth / 2, 110, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(goldR, goldG, goldB);
  doc.text(
    new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    pageWidth / 2,
    130,
    { align: "center" }
  );

  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(mutedR, mutedG, mutedB);
  const dedication = wrapText(
    doc,
    "Chaque mot laissé ici témoigne de l'estime et de la reconnaissance de toute l'équipe. Merci pour ces années partagées.",
    pageWidth - margin * 2
  );
  let y = 160;
  for (const line of dedication) {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 6;
  }
}

export async function generateSouvenirBookPdf(
  messages: Message[],
  coverImageData: string
): Promise<ArrayBuffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;

  // Page de couverture — image pleine page
  const coverFormat = coverImageData.startsWith("data:image/png") ? "PNG" : "JPEG";
  doc.addImage(coverImageData, coverFormat, 0, 0, pageWidth, pageHeight, undefined, "MEDIUM");

  // Page d'introduction
  doc.addPage();
  drawIntroPage(doc, messages.length);

  // Messages (ordre chronologique)
  const chronological = [...messages].reverse();
  let pageNum = 3;
  let y = margin + 5;

  doc.addPage();
  drawPageBackground(doc, pageWidth, pageHeight);
  drawPageFooter(doc, pageNum, pageWidth, pageHeight);

  for (const msg of chronological) {
    const hasPhoto = Boolean(msg.photo_url?.startsWith("data:image/"));
    const neededHeight = estimateMessageHeight(doc, msg, contentWidth, hasPhoto);

    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      pageNum += 1;
      drawPageBackground(doc, pageWidth, pageHeight);
      drawPageFooter(doc, pageNum, pageWidth, pageHeight);
      y = margin + 5;
    }

    y = drawMessage(doc, msg, y, margin, contentWidth, pageWidth);
  }

  return doc.output("arraybuffer");
}
