import { Hero } from "@/components/Hero";
import { LeaveMessageButton } from "@/components/LeaveMessageButton";
import { MessageWall } from "@/components/MessageWall";
import { getMessages, getMessageCount } from "@/lib/messages";
import type { Message } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let messages: Message[] = [];
  let count = 0;

  try {
    [messages, count] = await Promise.all([getMessages(), getMessageCount()]);
  } catch (error) {
    console.error("HomePage DB error:", error);
  }

  return (
    <div className="space-y-12">
      <Hero messageCount={count} />

      <div className="flex justify-center">
        <LeaveMessageButton />
      </div>

      <section>
        <h2 className="font-display mb-8 text-center text-2xl font-bold text-stone-800 sm:text-3xl">
          Mur des messages
        </h2>
        <MessageWall messages={messages} />
      </section>
    </div>
  );
}
