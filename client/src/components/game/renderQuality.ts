export const renderQuality = {
  reducedEffects: false,
};

export function updateRenderQuality() {
  if (typeof window === 'undefined') {
    renderQuality.reducedEffects = false;
    return renderQuality;
  }

  renderQuality.reducedEffects = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
  return renderQuality;
}

export function shadowBlur(_desktopValue: number, _mobileValue = 0) {
  // Le blur Canvas est désactivé partout, mobile comme PC.
  // Les couleurs et les formes restent identiques, mais le rendu est plus léger.
  return 0;
}
