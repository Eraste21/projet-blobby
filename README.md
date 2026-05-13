# Blobby — Chasseur vs Fuyard

Jeu JavaScript multijoueur en temps réel jouable dans le navigateur.

## Concept

- Un joueur devient le **chasseur rouge**.
- Un autre joueur devient le **fuyard bleu**.
- Le chasseur gagne s’il élimine le fuyard avant la fin du timer.
- Le fuyard gagne s’ils survit jusqu’à la fin du timer.

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
