# Mode clair appliqué à la map Canvas

Cette version applique aussi le mode clair à la map dessinée dans le Canvas.

## Principe

Le thème est lu depuis la même clé `localStorage` que le menu :

```ts
localStorage.getItem('blobby-theme')
```

Quand le thème vaut `light` :

- le fond noir de la map devient blanc ;
- les étoiles blanches deviennent noires ;
- les contours clairs de la map deviennent noirs ;
- les textes Canvas blancs liés à la map deviennent noirs.

Quand le thème vaut `dark`, les couleurs d'origine sont conservées.

## Fichiers modifiés

- `src/components/game/canvasTheme.ts`
- `src/components/game/drawMap.ts`
- `src/components/game/drawStars.ts`
- `src/components/game/drawWalls.ts`
- `src/components/game/drawZone.ts`
- `src/components/game/drawTimer.ts`
- `src/components/game/drawPlayer.ts`
- `src/components/Gamecanvas.tsx`

Les couleurs des joueurs, pouvoirs, items et textes existants n'ont pas été renommés ou supprimés.
