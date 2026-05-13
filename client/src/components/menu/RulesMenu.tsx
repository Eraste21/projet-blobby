import { MenuShell } from './MenuShell';

type RulesMenuProps = {
  onBack: () => void;
};

export function RulesMenu({ onBack }: RulesMenuProps) {
  return (
    <MenuShell>
      <div className="space-y-7">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Règles</p>
          <h1 className="mt-3 text-4xl font-bold">Chasseur vs Fuyard</h1>
        </div>

        <ul className="space-y-4 text-slate-300">
          <li><span className="font-bold text-red-300">Chasseur rouge :</span> attrape le fuyard avant la fin du timer.</li>
          <li><span className="font-bold text-sky-300">Fuyard bleu :</span> survit jusqu’à la fin du timer.</li>
          <li>Les déplacements sont <span className="text-white">Z (haut) - Q (gauche) - S (bas) - D (droite)</span>.</li>
          <li><span className="text-red-300 font-bold">Chasseur :</span> A = dash, E = radar, R = tir rapide (ralentit le fuyard).</li>
          <li><span className="text-sky-300 font-bold">Fuyard :</span> A = invisibilité, E = freeze, R = mur.</li>
          <li>Les soins (items verts) restaurent la vie, les bonus (items jaunes) donnent un boost de vitesse temporaire.</li>
          <li>La zone safe se réduit et des dégâts sont infligés hors zone.</li>
          <li>Appuie sur <span className="text-white">Échap</span> pendant la partie pour ouvrir le menu pause.</li>
        </ul>

        <button onClick={onBack} className="w-full rounded-2xl bg-sky-500 px-6 py-4 font-bold text-slate-950 hover:bg-sky-400">
          Retour
        </button>
      </div>
    </MenuShell>
  );
}
