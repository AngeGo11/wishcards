import { Calendar, User } from "lucide-react";
import type { Message } from "@/lib/types";

interface MessageCardProps {
  message: Message;
  index?: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageCard({ message, index = 0 }: MessageCardProps) {
  return (
    <article
      className="message-card group relative overflow-hidden rounded-2xl border border-amber-100/80 bg-white/90 p-6 shadow-md backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 opacity-60" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-300 text-white shadow">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">
                {message.emoji && <span className="mr-1.5">{message.emoji}</span>}
                {message.name}
              </h3>
              {message.signature && (
                <p className="text-sm text-stone-500">{message.signature}</p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-stone-700">
          {message.message}
        </p>

        {message.photo_url && (
          <div className="mt-4 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.photo_url}
              alt={`Photo souvenir de ${message.name}`}
              className="max-h-64 w-full object-cover"
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs text-stone-400">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={message.created_at}>{formatDate(message.created_at)}</time>
        </div>
      </div>
    </article>
  );
}
