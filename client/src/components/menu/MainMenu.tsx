import { BlobbyLogo } from './BlobbyLogo';
import { MenuShell } from './MenuShell';

type MainMenuProps = {
  playerName: string;
  onPlayerNameChange: (value: string) => void;
  onPlay: () => void;
  onRules: () => void;
  onSettings: () => void;
  onScores: () => void;
};

export function MainMenu({
  playerName,
  onPlayerNameChange,
  onPlay,
  onRules,
  onSettings,
  onScores,
}: MainMenuProps) {
  return (
    <MenuShell>
      <div className="text-center space-y-7">
        <div>
          <BlobbyLogo />
          <p className="mt-5 text-sm uppercase tracking-[0.45em] text-sky-300">Blobby</p>
          <h1 className="mt-3 text-5xl md:text-7xl font-bold">
            <span className="text-red-400">Chasseur</span>
            <span className="text-white"> vs </span>
            <span className="text-sky-400">Fuyard</span>
          </h1>
        </div>

        <div className="mx-auto max-w-md space-y-3 text-left">
          <label className="text-sm text-slate-300" htmlFor="player-name">
            Pseudo
          </label>
          <input
            id="player-name"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            maxLength={18}
            placeholder="Ex: Daniel"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none focus:border-sky-400"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <button onClick={onPlay} className="rounded-2xl bg-sky-500 px-6 py-4 font-bold text-slate-950 hover:bg-sky-400">
            Jouer
          </button>
          <button onClick={onRules} className="rounded-2xl border border-white/15 px-6 py-4 hover:bg-white/10">
            Règles
          </button>
          <button onClick={onSettings} className="rounded-2xl border border-white/15 px-6 py-4 hover:bg-white/10">
            Paramètres
          </button>
          <button onClick={onScores} className="rounded-2xl border border-white/15 px-6 py-4 hover:bg-white/10">
            Scores
          </button>
        </div>
      </div>
    </MenuShell>
  );
}
