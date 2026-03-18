
# FaceRehab_Js

## Description

FaceRehab_Js est une application de réhabilitation faciale utilisant le suivi facial en temps réel et la visualisation 3D.

## Structure du Projet

- **py_scripts/tracker** - Scripts Python pour le suivi facial et la gestion de la caméra
- **src/** - Application web frontend avec Three.js
- **py_scripts/livelink/** - Connecteur pour l'intégration Unreal Engine via Live Link

## Installation

### 1. Setup Python
```bash
cd py_scripts
python -m venv .venv
source .venv/bin/activate  # ou `.venv\Scripts\activate` sur Windows
pip install -r requirements.txt
```

### 2. Setup Node.js
```bash
npm install three
npx vite
```

### 3. Lancer l'application

**Terminal 1 - Caméra et Tracker :**
```bash
python py_scripts/tracker/main.py
```

**Terminal 2 - Serveur web :**
```bash
npx vite
```

**Terminal 3 - Lien avec LiveLink :**
```bash
python py_scripts/livelink/livelink_bridge.py
```

### 4. Live Link Bridge
Configuration de la connexion sur Unreal Engine est normalement directe dans le menu livelink.
