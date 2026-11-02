"use client";

import dynamic from "next/dynamic";

const RentRollApp = dynamic(() => import("@/components/RentRollApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-950 text-neutral-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purpleDark flex items-center justify-center shadow-lg shadow-brand-purple/20 ring-1 ring-white/10 animate-pulse">
          <span className="text-white font-bold text-lg">RR</span>
        </div>
        <p className="text-xs font-mono tracking-wide text-neutral-300">
          Loading RentRoll...
        </p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <RentRollApp />;
}
