import * as THREE from 'three'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'


// Module interne au projet
import { setupThree } from "./three/threeSetup";
import { setupControls } from "./three/controls";

import { loadFaceModel } from "./faceModel";

import {faceSync} from "./faceSync.js"


import {allSymSlidersValues} from "./ui/symmetrySlider";
import {updateCamera} from "./three/camera";

// -----------------------------------------------------

const appState = {
    keys: {},
    latestFaceValues: {},
    mainFaceModel: undefined
}

// THREE Setup - Construction de la scène
const {scene, camera, renderer} = setupThree();
document.body.appendChild(renderer.domElement)
// ------------------------------------------------

// Construction des contrôles clavier/souris
setupControls(camera, appState);

// Chargement du modèle de visage qui suit en temps réel les données du socket
const mainFaceModel = loadFaceModel(scene, appState, true)


// Connexion au WebSocket (programme Python local (main.py dans le dossier tracker))
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('WebSocket connecté');
};


ws.onmessage = (event) => {
    try {
        // On met juste à jour l'état, on n'applique pas directement
        appState.latestFaceValues = JSON.parse(event.data);
    } catch (e) {
        console.error('Erreur JSON WebSocket', e);
    }
};

ws.onclose = () => console.log('WebSocket fermé');

// ---------------------------------------------------------------------------------


// Debug element
const debug = document.getElementById('debug');


function animate(){
    requestAnimationFrame(animate)

    updateCamera(camera, appState)
    
    // Modification du visage en temps réel
    faceSync(appState.mainFaceModel, appState.latestFaceValues, allSymSlidersValues);

    // Update debug
    debug.innerText = `Camera: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`;

    renderer.render(scene,camera)
}

animate()

