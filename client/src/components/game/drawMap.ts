import { getCanvasTheme } from './canvasTheme';

export function configMap(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const theme = getCanvasTheme();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.mapBackground;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
