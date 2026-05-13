type PauseMenuProps = {
  onResume: () => void;
  onRestart: () => void;
  onBackToMenu: () => void;
};

export function PauseMenu({ onResume, onRestart, onBackToMenu }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/75 p-6 font-['Orbitron'] text-white backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Pause</p>
        <h1 className="mt-3 text-4xl font-bold">Partie en pause</h1>
        <div className="mt-7 grid gap-3">
          <button onClick={onResume} className="rounded-2xl bg-sky-500 px-6 py-4 font-bold text-slate-950 hover:bg-sky-400">
            Reprendre
          </button>
          <button onClick={onRestart} className="rounded-2xl border border-white/15 px-6 py-4 hover:bg-white/10">
            Rejouer
          </button>
          <button onClick={onBackToMenu} className="rounded-2xl border border-red-400/40 px-6 py-4 text-red-200 hover:bg-red-500/10">
            Retour au menu
          </button>
        </div>
      </section>
    </div>
  );
}
