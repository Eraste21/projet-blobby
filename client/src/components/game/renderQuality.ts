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

export function shadowBlur(desktopValue: number, mobileValue = 0) {
  return renderQuality.reducedEffects ? mobileValue : desktopValue;
}
