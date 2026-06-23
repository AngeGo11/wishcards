import { z } from "zod";
import { siteConfig } from "./config";

export const messageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire")
    .max(siteConfig.maxNameLength, `Maximum ${siteConfig.maxNameLength} caractères`),
  message: z
    .string()
    .trim()
    .min(1, "Le message est obligatoire")
    .max(siteConfig.maxMessageLength, `Maximum ${siteConfig.maxMessageLength} caractères`),
  signature: z
    .string()
    .trim()
    .max(200, "Maximum 200 caractères")
    .optional()
    .or(z.literal("")),
  photo_url: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val.startsWith("data:image/") || val.startsWith("http"),
      "Format de photo invalide"
    ),
  emoji: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || siteConfig.allowedEmojis.includes(val),
      "Emoji non autorisé"
    ),
  honeypot: z.string().optional(),
});

export type MessageFormData = z.infer<typeof messageSchema>;

export function validateMessage(data: unknown) {
  return messageSchema.safeParse(data);
}
