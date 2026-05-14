# Blobby

Blobby est un jeu multijoueur en temps réel jouable directement dans le navigateur.

Le jeu oppose deux joueurs dans une arène :
- le **Chasseur**, dont l’objectif est d’attraper le Fuyard ;
- le **Fuyard**, dont l’objectif est de survivre le plus longtemps possible.

Le gameplay repose sur les déplacements, l’utilisation de pouvoirs, l’évitement des obstacles et la gestion de la zone de jeu.

---

## Fonctionnalités

- Jeu multijoueur en temps réel
- Système de pseudo
- Lobby avant le lancement de la partie
- Déplacements clavier sur PC
- Joystick tactile sur mobile
- Utilisation des pouvoirs
- Gestion multi-touch sur mobile
- Collision avec les murs
- Fin de partie avec résultat
- Bouton pour rejouer
- Historique / scores locaux
- Menu de pause
- Menu des règles
- Menu des paramètres
- Mode sombre / mode clair
- Mode clair appliqué à l’interface et à la map
- Transitions entre les pages
- Interface responsive
- Optimisations Canvas pour améliorer les performances

---

## Technologies utilisées

### Frontend

- React
- TypeScript
- Vite
- HTML Canvas
- CSS

### Backend

- Node.js
- JavaScript / TypeScript
- Socket.IO

---

## Justification des choix techniques

React a été utilisé pour organiser l’interface du jeu en composants réutilisables : menus, paramètres, scores, lobby, écran de fin et canvas de jeu.

TypeScript permet de mieux structurer le code et de limiter les erreurs liées aux types, notamment pour les joueurs, les pouvoirs, les murs et les événements du jeu.

Vite a été choisi pour faciliter le développement frontend grâce à son serveur de développement rapide et sa configuration légère.

Le Canvas HTML est utilisé pour dessiner la partie en temps réel, car il est adapté aux jeux 2D avec déplacements, collisions, projectiles, effets visuels et caméra.

Socket.IO permet la communication en temps réel entre le client et le serveur. Il est utilisé pour synchroniser les joueurs, les positions, les actions et les événements de partie.

---

## Installation du projet en local

### 1. Cloner le dépôt

```bash
git clone <lien-du-repo>
cd <nom-du-projet>
```

### 2. Installer les dépendances du client

```bash
cd client
npm install
```

### 3. Installer les dépendances du serveur

```bash
cd ../server
npm install
```

---

## Lancement du projet en local

### 1. Lancer le serveur

Depuis le dossier `server` :

```bash
npm run dev
```

### 2. Lancer le client

Depuis le dossier `client` :

```bash
npm run dev
```

### 3. Ouvrir le jeu

Ouvrir le navigateur à l’adresse indiquée par Vite, généralement :

```txt
http://localhost:5173
```

---

## Commandes du jeu

### Sur PC

| Action | Touche |
|---|---|
| Avancer | Z |
| Aller à gauche | Q |
| Reculer | S |
| Aller à droite | D |
| Utiliser les pouvoirs | Boutons à l’écran |
| Mettre en pause | Bouton pause |

### Sur mobile

| Action | Contrôle |
|---|---|
| Se déplacer | Joystick tactile |
| Utiliser les pouvoirs | Boutons tactiles |
| Mettre en pause | Bouton pause |

Le jeu supporte le multi-touch : il est possible de se déplacer avec le joystick tout en utilisant un pouvoir avec un autre doigt.

---

## Règles du jeu

Deux joueurs s’affrontent dans une map fermée.

Le Chasseur doit poursuivre le Fuyard et réussir à l’attraper.

Le Fuyard doit éviter le Chasseur en utilisant ses déplacements, les obstacles et ses pouvoirs.

Chaque rôle possède des capacités spécifiques permettant de rendre la partie plus stratégique.

La partie se termine lorsqu’une condition de victoire est atteinte.

---

## Modes d’affichage

Le jeu propose deux thèmes :

- mode sombre ;
- mode clair.

Le mode clair inverse également les couleurs principales de la map :
- le fond noir devient blanc ;
- les éléments blancs deviennent noirs.

Le thème choisi est sauvegardé localement dans le navigateur.

---

## Optimisations

Plusieurs optimisations ont été ajoutées pour améliorer les performances :

- réduction du nombre d’étoiles affichées ;
- désactivation du `shadowBlur` ;
- dessin limité à la zone visible de la caméra ;
- évitement du rendu des éléments hors écran ;
- amélioration du comportement tactile sur mobile ;
- menus scrollables sur mobile ;
- transitions légères entre les pages.

---

## Structure générale du projet

```txt
client/
  src/
    components/
    game/
    hooks/
    pages/
    App.tsx
    main.tsx

server/
  src/
    ...
```

Le dossier `client` contient l’interface, les menus, la logique Canvas et la partie visuelle du jeu.

Le dossier `server` contient la logique multijoueur et la communication temps réel.

---

## Build de production

### Client

```bash
cd client
npm run build
```

### Serveur

```bash
cd server
npm run build
```

---

## Déploiement

Le jeu est prévu pour être hébergé en ligne.

Le frontend peut être déployé sur une plateforme comme Vercel, Netlify ou Render.

Le backend peut être déployé sur une plateforme compatible Node.js comme Render, Railway ou Fly.io.

---
