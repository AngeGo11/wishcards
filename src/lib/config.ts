export const siteConfig = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE ?? "Livre d'Or de Départ à la Retraite",
  retireeName: process.env.NEXT_PUBLIC_RETIREE_NAME ?? "notre collègue",
  retireePhoto: process.env.NEXT_PUBLIC_RETIREE_PHOTO ?? "",
  introText:
    process.env.NEXT_PUBLIC_INTRO_TEXT ??
    "Avant son départ à la retraite, laissez-lui un mot chaleureux. Chaque message compte et fera sourire !",
  maxPhotoSizeBytes: 1_000_000,
  maxMessageLength: 2000,
  maxNameLength: 100,
  rateLimitMax: 3,
  rateLimitWindowMinutes: 60,
  allowedEmojis: ["🎉", "💖", "🌟", "🥂", "🌸", "👏", "🎊", "💐", "☀️", "🙏"],
};
