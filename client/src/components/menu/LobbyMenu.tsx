import { MenuShell } from './MenuShell';

type LobbyMenuProps = {
  playerName: string;
  errorMessage?: string;
  onStart: () => void;
  onBack: () => void;
};

export function LobbyMenu({ playerName, errorMessage, onStart, onBack }: LobbyMenuProps) {
  return (
    <MenuShell>
      <div className="space-y-7">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Salon</p>
          <h1 className="mt-3 text-4xl font-bold">Prêt à rejoindre la partie</h1>
          <p className="mt-3 text-slate-300">Pseudo : {playerName || 'Joueur'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
            <h2 className="text-xl font-bold text-red-300">Chasseur</h2>
            <p className="mt-2 text-sm text-slate-300">Le premier joueur connecté devient rouge et doit attraper le fuyard.</p>
          </div>
          <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-5">
            <h2 className="text-xl font-bold text-sky-300">Fuyard</h2>
            <p className="mt-2 text-sm text-slate-300">Le deuxième joueur devient bleu et doit survivre jusqu’à la fin du timer.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={onStart} className="flex-1 rounded-2xl bg-sky-500 px-6 py-4 font-bold text-slate-950 hover:bg-sky-400">
            Rejoindre
          </button>
          <button onClick={onBack} className="flex-1 rounded-2xl border border-white/15 px-6 py-4 hover:bg-white/10">
            Retour
          </button>
        </div>
      </div>
    </MenuShell>
  );
}
