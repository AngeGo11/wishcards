import Link from "next/link";
import { PenLine } from "lucide-react";

export function LeaveMessageButton() {
  return (
    <Link
      href="/message/nouveau"
      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-400 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
    >
      <PenLine className="h-5 w-5 transition-transform group-hover:-rotate-12" />
      Laisser un message
    </Link>
  );
}
