import { AdminPanel } from "@/components/AdminPanel";
import { isAdminAuthenticated } from "@/lib/auth";
import { getMessages } from "@/lib/messages";
import { siteConfig } from "@/lib/config";
import type { Message } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Administration — ${siteConfig.title}`,
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  let messages: Message[] = [];

  if (authenticated) {
    try {
      messages = await getMessages();
    } catch (error) {
      console.error("AdminPage DB error:", error);
    }
  }

  return (
    <div>
      <AdminPanel initialMessages={messages} isAuthenticated={authenticated} />
    </div>
  );
}
