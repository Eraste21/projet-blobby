# Blobby — Chasseur vs Fuyard

Blobby est un jeu JavaScript multijoueur en temps réel jouable directement dans le navigateur.

Le jeu oppose deux joueurs dans une arène :

- un **chasseur rouge**
- un **fuyard bleu**

Le chasseur doit éliminer le fuyard avant la fin du temps imparti.  
Le fuyard doit survivre jusqu’à la fin du timer.

---

## Sommaire

- [Concept](#concept)
- [Fonctionnalités](#fonctionnalités)
- [Commandes du jeu](#commandes-du-jeu)
- [Pouvoirs](#pouvoirs)
- [Installation locale](#installation-locale)
- [Variables d’environnement](#variables-denvironnement)
- [Lancement avec Docker](#lancement-avec-docker)
- [Build de production](#build-de-production)
- [Déploiement](#déploiement)
- [Choix techniques](#choix-techniques)
- [Architecture du projet](#architecture-du-projet)
- [Sons](#sons)
- [Favicon](#favicon)
- [Améliorations possibles](#améliorations-possibles)
- [Auteur](#auteur)
- [Liens](#liens)

---

## Concept

Blobby est un jeu en **1 contre 1**.

Le premier joueur connecté devient automatiquement le **chasseur**.  
Le deuxième joueur connecté devient automatiquement le **fuyard**.

Une fois les deux joueurs connectés, la partie commence.

### Objectif du chasseur

Le chasseur doit attraper ou éliminer le fuyard avant la fin du timer.

### Objectif du fuyard

Le fuyard doit survivre jusqu’à la fin du timer en utilisant ses déplacements, ses pouvoirs et les items présents sur l’arène.

---

## Fonctionnalités

- Jeu multijoueur en temps réel avec Socket.io
- Mode **1 chasseur vs 1 fuyard**
- Attribution automatique des rôles
- Chasseur affiché en rouge
- Fuyard affiché en bleu
- Backend autoritaire pour la logique de jeu
- Déplacements synchronisés entre les joueurs
- Collisions avec les murs
- Collisions avec les murs temporaires
- Zone de danger qui se réduit progressivement
- Système de points de vie
- Système de victoire et défaite
- Pseudo personnalisable
- Menu principal
- Lobby
- Menu des règles
- Menu des paramètres
- Menu pause
- Écran de fin de partie
- Historique local des dernières parties avec `localStorage`
- Items sur l’arène :
  - soins
  - boost de vitesse
- Pouvoirs du chasseur :
  - dash
  - radar
  - tir rapide ralentissant
- Pouvoirs du fuyard :
  - invisibilité
  - freeze
  - mur temporaire placé derrière le joueur
- Cooldowns des pouvoirs
- Durées d’effet gérées côté serveur
- Invisibilité réelle du fuyard sur l’écran du chasseur
- HUD avec informations de partie
- Messages d’événements en jeu
- Sons préparés côté client
- Favicon SVG personnalisé pour Blobby
- Interface responsive
- Contrôles tactiles pour mobile
- Dockerfile client
- Dockerfile serveur
- Docker Compose

---

## Commandes du jeu

### Clavier

| Touche | Action |
|---|---|
| `Z` | Se déplacer vers le haut |
| `Q` | Se déplacer vers la gauche |
| `S` | Se déplacer vers le bas |
| `D` | Se déplacer vers la droite |
| `A` | Utiliser le pouvoir 1 |
| `E` | Utiliser le pouvoir 2 |
| `R` | Utiliser le pouvoir 3 |
| `Échap` | Mettre le jeu en pause |

### Mobile

Sur mobile, des boutons tactiles permettent de :

- se déplacer ;
- utiliser les pouvoirs ;
- mettre le jeu en pause.

---

## Pouvoirs

### Pouvoirs du chasseur

| Touche | Pouvoir | Description |
|---|---|---|
| `A` | Dash | Permet au chasseur d’accélérer brièvement. |
| `E` | Radar | Indique temporairement la direction du fuyard. |
| `R` | Tir rapide | Tire un projectile qui ralentit le fuyard touché. |

### Pouvoirs du fuyard

| Touche | Pouvoir | Description |
|---|---|---|
| `A` | Invisibilité | Rend le fuyard invisible sur l’écran du chasseur pendant quelques secondes. |
| `E` | Freeze | Ralentit ou bloque temporairement le chasseur. |
| `R` | Mur temporaire | Place un mur derrière le fuyard pour gêner le chasseur. |

---

## Installation locale

Le projet est divisé en deux parties :

- `client` : frontend React/Vite
- `server` : backend NestJS/Socket.io

### 1. Cloner le projet

```bash
git clone https://github.com/TON-PSEUDO/TON-REPO.git
cd TON-REPO
```

Remplace `TON-PSEUDO` et `TON-REPO` par les informations de ton dépôt GitHub.

### 2. Lancer le serveur

Dans un premier terminal :

```bash
cd server
npm install
npm run start:dev
```

Le serveur démarre généralement sur :

```txt
http://localhost:3000
```

### 3. Lancer le client

Dans un deuxième terminal :

```bash
cd client
npm install
npm run dev
```

Vite affiche ensuite une URL, généralement :

```txt
http://localhost:5173
```

Ouvre cette URL dans ton navigateur.

### 4. Tester le multijoueur

Pour tester le jeu en local :

1. ouvrir un premier onglet sur `http://localhost:5173` ;
2. entrer un pseudo et rejoindre la partie ;
3. ouvrir un deuxième onglet ou un deuxième navigateur ;
4. entrer un autre pseudo et rejoindre la partie.

Le premier joueur devient le **chasseur rouge**.  
Le deuxième joueur devient le **fuyard bleu**.

Un troisième joueur est refusé, car le jeu fonctionne en **1 contre 1**.

---

## Variables d’environnement

### Client

Créer un fichier :

```txt
client/.env
```

Contenu :

```env
VITE_SERVER_URL=http://localhost:3000
```

### Serveur

Créer un fichier :

```txt
server/.env
```

Contenu :

```env
PORT=3000
CLIENT_URL=http://localhost:5173
```

---

## Lancement avec Docker

Depuis la racine du projet :

```bash
docker compose up --build
```

Pour arrêter les conteneurs :

```bash
docker compose down
```

Pour relancer proprement :

```bash
docker compose down
docker compose up --build
```

---

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

Le dossier généré pour le frontend est :

```txt
client/dist
```

---

## Déploiement

Le projet peut être déployé avec deux services séparés :

- frontend React/Vite sur Vercel, Netlify ou autre plateforme frontend ;
- backend NestJS/Socket.io sur Render, Railway, Fly.io ou un VPS.

### Variables à configurer en production

#### Frontend

```env
VITE_SERVER_URL=https://url-du-backend
```

#### Backend

```env
PORT=3000
CLIENT_URL=https://url-du-frontend
```

Le backend doit autoriser l’URL du frontend pour permettre la connexion Socket.io.

---

## Choix techniques

### React + TypeScript + Vite

React permet de créer une interface claire et découpée en composants.  
TypeScript aide à mieux structurer le code et à éviter certaines erreurs.  
Vite permet un développement rapide avec un serveur local efficace et un build léger.

### Canvas API

Le jeu utilise le Canvas API pour dessiner l’arène, les joueurs, les items, les projectiles et les éléments visuels en temps réel.

Canvas est adapté pour ce projet car il permet :

- un rendu 2D fluide ;
- une caméra qui suit le joueur ;
- un contrôle précis du dessin ;
- un affichage performant pour les objets du jeu.

### NestJS

NestJS est utilisé pour structurer le backend proprement.

Il permet de séparer :

- la passerelle WebSocket ;
- la logique du jeu ;
- les types ;
- la configuration ;
- les règles liées aux pouvoirs et aux items.

### Socket.io

Socket.io est utilisé pour gérer le multijoueur en temps réel.

Il permet :

- la connexion des joueurs ;
- l’envoi des touches du client vers le serveur ;
- la synchronisation de l’état du jeu ;
- l’envoi des événements de jeu.

### Backend autoritaire

Le serveur est responsable des éléments importants du jeu :

- positions des joueurs ;
- collisions ;
- points de vie ;
- items ;
- pouvoirs ;
- cooldowns ;
- projectiles ;
- conditions de victoire.

Ce choix évite que chaque client ait une version différente de la partie.

### LocalStorage

Le `localStorage` est utilisé pour sauvegarder localement certaines informations comme l’historique des dernières parties.

### Docker

Docker permet de lancer plus facilement le client et le serveur dans des conteneurs séparés.

Docker Compose permet de démarrer l’ensemble du projet avec une seule commande.

---

## Architecture du projet

```txt
blobby/
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── sounds/
│   ├── src/
│   │   ├── components/
│   │   │   ├── game/
│   │   │   └── menu/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── game/
│   │   │   ├── game.config.ts
│   │   │   ├── game.gateway.ts
│   │   │   ├── game.service.ts
│   │   │   ├── game.types.ts
│   │   │   ├── items.config.ts
│   │   │   └── powers.config.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Sons

Le projet contient un dossier prévu pour les sons :

```txt
client/public/sounds/
```

Les fichiers audio peuvent être ajoutés avec les noms suivants :

```txt
shoot.mp3
dash.mp3
radar.mp3
heal.mp3
speed.mp3
hit.mp3
freeze.mp3
invisibility.mp3
wall.mp3
victory.mp3
defeat.mp3
click.mp3
background.mp3
```

Si certains fichiers audio sont absents, le jeu continue de fonctionner.

---

## Favicon

Le projet utilise un favicon personnalisé pour Blobby :

```txt
client/public/favicon.svg
```

Le favicon représente le concept du jeu :

- moitié gauche bleue pour le fuyard ;
- moitié droite rouge pour le chasseur ;
- séparation centrale.

---

## Améliorations possibles

Voici quelques améliorations possibles pour une version future :

- ajout d’un système de comptes utilisateur ;
- ajout d’un classement en ligne ;
- sauvegarde des scores dans une base de données ;
- création de plusieurs rooms ;
- matchmaking automatique ;
- personnalisation de l’apparence des joueurs ;
- ajout de nouvelles cartes ;
- ajout de nouveaux pouvoirs ;
- ajout d’une boutique ou d’une économie en jeu ;
- ajout d’un tutoriel interactif ;
- amélioration des animations ;
- ajout d’une musique dynamique ;
- optimisation du gameplay mobile.

---

## Auteur

Projet réalisé par :

```txt
Daniel Konan
```

---

## Liens

Lien du jeu en ligne :

```txt
À ajouter après déploiement
```

Lien du dépôt GitHub :

```txt
À ajouter
```
