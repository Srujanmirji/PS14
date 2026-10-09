import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router";

export function AppShell(): ReactNode {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Results", path: "/results" },
    { label: "Documents", path: "/documents" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#070B1A] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070B1A]/80 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Yojana Saathi Logo" className="w-8 h-8 rounded-lg" />
          <h1 className="text-lg font-bold tracking-tight text-white">Yojana Saathi</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium">
            PWA Ready
          </span>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 flex flex-col justify-center">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-40 backdrop-blur-xl bg-[#070B1A]/90 border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-xl mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-indigo-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
