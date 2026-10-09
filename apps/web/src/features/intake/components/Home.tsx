import type { ReactNode } from "react";

export function Home(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
        Find Schemes You Qualify For
      </h2>
      <p className="text-sm text-slate-300 max-w-sm">
        Tell Saathi about yourself to discover welfare schemes tailored for you.
      </p>
    </div>
  );
}
