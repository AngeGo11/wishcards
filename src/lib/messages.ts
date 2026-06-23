import { getSupabase } from "./supabase";
import type { Message, MessageInput } from "./types";

export async function getMessages(): Promise<Message[]> {
  const { data, error } = await getSupabase()
    .from("messages")
    .select("id, name, message, signature, photo_url, emoji, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    created_at: new Date(row.created_at).toISOString(),
  }));
}

export async function getMessageCount(): Promise<number> {
  const { count, error } = await getSupabase()
    .from("messages")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}

export async function createMessage(
  input: MessageInput,
  ipHash: string
): Promise<number> {
  const { data, error } = await getSupabase()
    .from("messages")
    .insert({
      name: input.name,
      message: input.message,
      signature: input.signature || null,
      photo_url: input.photo_url || null,
      emoji: input.emoji || null,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteMessage(id: number): Promise<boolean> {
  const { error, count } = await getSupabase()
    .from("messages")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}
