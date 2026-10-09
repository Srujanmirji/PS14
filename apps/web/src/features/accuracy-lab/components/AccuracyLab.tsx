import type { ReactNode } from "react";

export function AccuracyLab(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Accuracy Lab</h2>
      <p className="text-sm text-slate-300">Engine benchmarking and eval validation.</p>
    </div>
  );
}
