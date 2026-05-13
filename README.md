# Blobby — Chasseur vs Fuyard

Jeu JavaScript multijoueur en temps réel jouable dans le navigateur.

## Concept

- Un joueur devient le **chasseur rouge**.
- Les autres joueurs deviennent des **fuyards bleus**.
- Le chasseur gagne s’il élimine tous les fuyards avant la fin du timer.
- Les fuyards gagnent s’ils survivent jusqu’à la fin du timer.

## Fonctionnalités

- Multijoueur temps réel avec Socket.io.
- Gameplay chasseur vs fuyard.
- Pseudo personnalisable.
- Menu principal, lobby, règles, paramètres, pause, fin de partie et historique.
- Historique local des dernières parties avec `localStorage`.
- Zone de danger qui se réduit.
- Collisions avec les murs et les murs temporaires.
- Items sur l’arène : soins et boost de vitesse.
- Pouvoirs du chasseur : dash, radar, tir rapide ralentissant.
- Pouvoirs du fuyard : invisibilité, freeze, mur placé derrière le fuyard.
- Cooldowns et durées d’effet gérés côté serveur.
- Dockerfile client, Dockerfile serveur et docker-compose.
- Favicon SVG spécifique à Blobby.
- Interface responsive avec contrôles tactiles pour mobile.

## Commandes du jeu

- `Z` : haut
- `Q` : gauche
- `S` : bas
- `D` : droite
- `A` : pouvoir 1
- `E` : pouvoir 2
- `R` : pouvoir 3
- `Échap` : pause

### Pouvoirs du chasseur

- `A` : Dash
- `E` : Radar
- `R` : Tir rapide

### Pouvoirs du fuyard

- `A` : Invisibilité
- `E` : Freeze
- `R` : Mur temporaire derrière le joueur

## Installation locale

### 1. Lancer le serveur

```bash
cd server
npm install
npm run start:dev
```

### 2. Lancer le client

Dans un deuxième terminal :

```bash
cd client
npm install
npm run dev
```

Ouvrir ensuite l’URL affichée par Vite, généralement :

```txt
http://localhost:5173
```

Pour tester le multijoueur, ouvrir deux onglets ou deux navigateurs.

## Variables d’environnement

### Client

Créer `client/.env` :

```env
VITE_SERVER_URL=http://localhost:3000
```

### Serveur

Créer `server/.env` :

```env
PORT=3000
CLIENT_URL=http://localhost:5173
```

## Lancement avec Docker

Depuis la racine du projet :

```bash
docker compose up --build
```

## Build de production

### Serveur

```bash
cd server
npm install
npm run build
npm run start:prod
```

### Client

```bash
cd client
npm install
npm run build
```

## Choix techniques

- **React + TypeScript + Vite** : interface rapide à développer, typage utile et build léger.
- **Canvas API** : adaptée pour un jeu 2D avec déplacement fluide, caméra, particules et rendu temps réel.
- **NestJS + Socket.io** : backend JavaScript/TypeScript structuré, adapté au multijoueur temps réel.
- **Backend autoritaire** : le serveur décide des positions, collisions, dégâts, items et pouvoirs pour éviter les incohérences côté client.
- **Docker** : facilite le lancement et le déploiement des deux parties du projet.

## Déploiement conseillé

- Frontend : Vercel ou Netlify.
- Backend : Render, Railway, Fly.io ou VPS Docker.
- Mettre `VITE_SERVER_URL` sur l’URL publique du backend.
- Mettre `CLIENT_URL` sur l’URL publique du frontend.


## Mise à jour gameplay

- HUD global allégé : PV du chasseur en haut à gauche, PV des fuyards en haut à droite, avec opacité réduite pour ne pas gêner la visibilité.
- Timer et messages d’événements rendus plus compacts.
- Pouvoir du chasseur `R` : tir rapide de pistolet qui inflige des dégâts légers et ralentit le fuyard touché.
- Messages d’événements à l’écran : pouvoirs utilisés, soins récupérés, tirs réussis, éliminations.
- Favicon spécifique à Blobby dans `client/public/favicon.svg`.
- Jeu jouable sur mobile avec boutons tactiles pour déplacement, pouvoirs et pause.
- Curseur interactif sur les boutons.

## Sons du jeu

Le projet contient maintenant un dossier prêt pour les effets sonores :

```txt
client/public/sounds/
```

Place les fichiers audio avec ces noms exacts :

- `shoot.mp3` : tir rapide du chasseur
- `dash.mp3` : dash du chasseur
- `radar.mp3` : radar du chasseur
- `heal.mp3` : soin récupéré
- `speed.mp3` : boost de vitesse
- `hit.mp3` : joueur touché
- `freeze.mp3` : freeze du fuyard
- `invisibility.mp3` : invisibilité du fuyard
- `wall.mp3` : mur temporaire du fuyard
- `victory.mp3` : victoire
- `defeat.mp3` : défaite
- `click.mp3` : clic de menu
- `background.mp3` : musique de fond

Le fichier `client/src/utils/sound.ts` gère la lecture des sons. Si un fichier manque, le jeu continue sans erreur.

## Effet lorsqu'un joueur est touché

Quand un fuyard est touché par le tir rapide du chasseur, le backend ajoute un court état `hitUntil`. Le canvas utilise cet état pour faire clignoter le joueur touché, comme dans les jeux où le personnage perd une vie.
