export type CanvasTheme = {
  isLight: boolean;
  mapBackground: string;
  mapForeground: string;
  mapForegroundSoft: string;
  mapOverlay: string;
  panelBackground: string;
  panelBorder: string;
  panelText: string;
};

const THEME_KEY = 'blobby-theme';

export function getCanvasTheme(): CanvasTheme {
  const isLight = localStorage.getItem(THEME_KEY) === 'light';

  return {
    isLight,
    mapBackground: isLight ? '#ffffff' : '#000000',
    mapForeground: isLight ? '#000000' : '#ffffff',
    mapForegroundSoft: isLight ? '#000000' : '#e0f7ff',
    mapOverlay: isLight ? 'rgba(0, 0, 0, 0.10)' : 'rgba(224, 247, 255, 0.12)',
    panelBackground: isLight ? 'rgba(255, 255, 255, 0.62)' : 'rgba(2, 6, 23, 0.54)',
    panelBorder: isLight ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.12)',
    panelText: isLight ? 'rgba(0,0,0,0.88)' : 'rgba(255,255,255,0.88)',
  };
}
