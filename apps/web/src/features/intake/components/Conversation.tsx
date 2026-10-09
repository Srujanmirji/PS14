import type { ReactNode } from "react";

export function Conversation(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-semibold text-white mb-2">Conversation</h2>
      <p className="text-sm text-slate-300">Intake dialogue placeholder.</p>
    </div>
  );
}
