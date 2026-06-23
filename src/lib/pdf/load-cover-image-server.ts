import { readFile } from "fs/promises";
import { join } from "path";

export async function loadCoverImageServer(): Promise<string> {
  const paths = [
    join(process.cwd(), "public/assets/cover-livre-dor.jpg"),
    join(process.cwd(), "modèle_livre_dor.png"),
  ];

  for (const filePath of paths) {
    try {
      const buffer = await readFile(filePath);
      const mime = filePath.endsWith(".png") ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    } catch {
      continue;
    }
  }

  const { COVER_IMAGE_BASE64 } = await import("./cover-image-base64");
  return COVER_IMAGE_BASE64;
}
