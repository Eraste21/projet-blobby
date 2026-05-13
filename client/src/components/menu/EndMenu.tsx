import { MenuShell } from './MenuShell';

type EndMenuProps = {
  result: string;
  onReplay: () => void;
  onBackToMenu: () => void;
};

export function EndMenu({ result, onReplay, onBackToMenu }: EndMenuProps) {
  return (
    <MenuShell>
      <div className="space-y-7 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Fin de la partie</p>
        <h1 className="text-5xl font-bold">{result || 'Partie terminée'}</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={onReplay} className="rounded-2xl bg-sky-500 px-6 py-4 font-bold text-slate-950 hover:bg-sky-400">
            Rejouer
          </button>
          <button onClick={onBackToMenu} className="rounded-2xl border border-white/15 px-6 py-4 hover:bg-white/10">
            Menu principal
          </button>
        </div>
      </div>
    </MenuShell>
  );
}
