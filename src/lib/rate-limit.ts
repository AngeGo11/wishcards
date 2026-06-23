import { createHash } from "crypto";
import { getSupabase } from "./supabase";
import { siteConfig } from "./config";

export function hashIp(ip: string): string {
  const secret = process.env.RATE_LIMIT_SECRET ?? "wishcards-default-secret";
  return createHash("sha256").update(`${ip}:${secret}`).digest("hex");
}

function getWindowStart(): string {
  const windowStart = new Date();
  windowStart.setMinutes(
    windowStart.getMinutes() -
      (windowStart.getMinutes() % siteConfig.rateLimitWindowMinutes),
    0,
    0
  );
  return windowStart.toISOString();
}

export async function checkRateLimit(ipHash: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const windowStart = getWindowStart();

  const { data, error } = await getSupabase()
    .from("rate_limits")
    .select("submission_count")
    .eq("ip_hash", ipHash)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (error) throw error;

  const count = data?.submission_count ?? 0;
  const remaining = Math.max(0, siteConfig.rateLimitMax - count);

  return {
    allowed: count < siteConfig.rateLimitMax,
    remaining,
  };
}

export async function recordSubmission(ipHash: string): Promise<void> {
  const windowStart = getWindowStart();
  const supabase = getSupabase();

  const { data: existing, error: selectError } = await supabase
    .from("rate_limits")
    .select("submission_count")
    .eq("ip_hash", ipHash)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from("rate_limits")
      .update({ submission_count: existing.submission_count + 1 })
      .eq("ip_hash", ipHash)
      .eq("window_start", windowStart);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("rate_limits").insert({
    ip_hash: ipHash,
    window_start: windowStart,
    submission_count: 1,
  });
  if (error) throw error;
}
