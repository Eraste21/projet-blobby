export function endScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, result: string) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.shadowColor = '#e0f7ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'white';
  ctx.font = '700 48px Orbitron';
  ctx.textAlign = 'center';

  ctx.fillText(result, canvas.width / 2, canvas.height / 2);

  ctx.shadowBlur = 0;
  ctx.font = '700 22px Orbitron';
  ctx.fillText('Recharge la page pour recommencer', canvas.width / 2, canvas.height / 2 + 50);

  ctx.textAlign = 'left';
}
