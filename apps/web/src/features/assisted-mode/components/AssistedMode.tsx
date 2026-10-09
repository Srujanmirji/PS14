import type { ReactNode } from "react";

export function AssistedMode(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Assisted Mode</h2>
      <p className="text-sm text-slate-300">Operator workflow for field workers.</p>
    </div>
  );
}
