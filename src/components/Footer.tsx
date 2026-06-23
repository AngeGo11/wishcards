import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-amber-100/60 bg-white/40 py-6 text-center text-sm text-stone-500 backdrop-blur">
      <p>
        Fait avec gratitude pour {siteConfig.retireeName} ·{" "}
        <Link href="/admin" className="text-amber-600/70 hover:text-amber-700 hover:underline">
          Admin
        </Link>
      </p>
    </footer>
  );
}
