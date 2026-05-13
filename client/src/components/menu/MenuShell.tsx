import type { ReactNode } from 'react';

type MenuShellProps = {
  children: ReactNode;
};

export function MenuShell({ children }: MenuShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-['Orbitron']">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,170,255,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,43,43,0.25),transparent_35%)]" />
      <section className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900/85 p-8 shadow-2xl backdrop-blur">
        {children}
      </section>
    </main>
  );
}
