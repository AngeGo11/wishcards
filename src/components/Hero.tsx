import { Sparkles, Heart, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config";

interface HeroProps {
  messageCount: number;
}

export function Hero({ messageCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 px-6 py-12 text-center shadow-lg sm:px-12 sm:py-16">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-4 flex justify-center gap-2 text-amber-600">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <Heart className="h-5 w-5" />
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl md:text-5xl">
          {siteConfig.title}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-stone-600 sm:text-xl">
          {siteConfig.introText.replace("notre collègue", siteConfig.retireeName)}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm backdrop-blur">
          <MessageCircle className="h-4 w-4" />
          <span>
            {messageCount} message{messageCount !== 1 ? "s" : ""} reçu
            {messageCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
