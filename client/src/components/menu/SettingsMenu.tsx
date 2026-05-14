import { MenuShell } from './MenuShell';

export type ThemeMode = 'dark' | 'light';

type SettingsMenuProps = {
  soundEnabled: boolean;
  themeMode: ThemeMode;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onBack: () => void;
};

export function SettingsMenu({ soundEnabled, themeMode, onToggleSound, onToggleTheme, onBack }: SettingsMenuProps) {
  return (
    <MenuShell>
      <div className="space-y-7">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Paramètres</p>
          <h1 className="mt-3 text-4xl font-bold">Options</h1>
        </div>

        <button onClick={onToggleSound} className="w-full rounded-2xl border border-white/15 px-6 py-4 text-left hover:bg-white/10">
          Son : <span className="font-bold">{soundEnabled ? 'activé' : 'désactivé'}</span>
        </button>

        <button onClick={onToggleTheme} className="w-full rounded-2xl border border-white/15 px-6 py-4 text-left hover:bg-white/10">
          Mode : <span className="font-bold">{themeMode === 'dark' ? 'sombre' : 'clair'}</span>
        </button>

        <button onClick={onBack} className="w-full rounded-2xl bg-sky-500 px-6 py-4 font-bold text-slate-950 hover:bg-sky-400">
          Retour
        </button>
      </div>
    </MenuShell>
  );
}
