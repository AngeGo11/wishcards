import type { Message } from "@/lib/types";
import { MessageCard } from "./MessageCard";
import { MessageSquare } from "lucide-react";

interface MessageWallProps {
  messages: Message[];
}

export function MessageWall({ messages }: MessageWallProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-white/50 px-6 py-16 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-amber-300" />
        <p className="mt-4 text-lg text-stone-500">
          Aucun message pour le moment. Soyez le premier à écrire !
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {messages.map((message, index) => (
        <MessageCard key={message.id} message={message} index={index} />
      ))}
    </div>
  );
}
