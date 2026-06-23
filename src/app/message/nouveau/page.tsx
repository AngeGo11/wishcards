import { MessageForm } from "@/components/MessageForm";
import { siteConfig } from "@/lib/config";

export const metadata = {
  title: `Laisser un message — ${siteConfig.title}`,
};

export default function NewMessagePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-stone-800">
          Laisser un message
        </h1>
        <p className="mt-2 text-stone-600">
          Partagez un mot chaleureux pour {siteConfig.retireeName}
        </p>
      </div>
      <MessageForm />
    </div>
  );
}
