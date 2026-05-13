import { MenuShell } from './MenuShell';

export type MatchHistoryEntry = {
  id: string;
  date: string;
  result: string;
  playerName: string;
};

type ScoreMenuProps = {
  history: MatchHistoryEntry[];
  onClear: () => void;
  onBack: () => void;
};

export function ScoreMenu({ history, onClear, onBack }: ScoreMenuProps) {
  return (
    <MenuShell>
      <div className="space-y-7">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Historique</p>
          <h1 className="mt-3 text-4xl font-bold">Tes dernières parties</h1>
        </div>

        {history.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-300">
            Aucune partie enregistrée pour le moment.
          </p>
        ) : (
          <div className="max-h-80 space-y-3 overflow-auto pr-2">
            {history.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="font-bold text-white">{entry.result}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {entry.playerName} · {new Date(entry.date).toLocaleString('fr-FR')}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={onBack} className="rounded-2xl bg-sky-500 px-6 py-4 font-bold text-slate-950 hover:bg-sky-400">
            Retour
          </button>
          <button onClick={onClear} className="rounded-2xl border border-white/15 px-6 py-4 hover:bg-white/10">
            Effacer l’historique
          </button>
        </div>
      </div>
    </MenuShell>
  );
}
