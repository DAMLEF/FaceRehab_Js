import * as THREE from 'three'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'


// Module interne au projet
import { setupThree } from "./three/threeSetup";
import { setupControls } from "./three/controls";

import { loadFaceModel } from "./faceModel";

import { faceSync } from "./faceSync.js"
import { faceMatch } from "./faceMatch";

import { rehabExercise } from "./rehabExercise";


import {allSymSlidersValues} from "./ui/symmetrySlider";
import {updateCamera} from "./three/camera";
import {downloadJSONFile} from "./utils/downloadFile";

// -----------------------------------------------------

const appState = {
    keys: {},
    latestFaceValues: {},

    mainFaceModel: undefined,
    secondFaceModel: undefined,

    similarityScore: 0,

    rehabEx: undefined
}

// THREE Setup - Construction de la scène
const {scene, camera, renderer} = setupThree();
document.body.appendChild(renderer.domElement)
// ------------------------------------------------

// Construction des contrôles clavier/souris
setupControls(camera, appState);


// Chargement du modèle de visage qui suit en temps réel les données du socket (et on le range dans appState, car asynchrone)
loadFaceModel(scene, appState, true)

// TODO : Test
loadFaceModel(scene, appState, false)





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

    // Téléchargement en fichier des BS de la face courante
    // TODO : Déplacer ?
    if( appState.keys["y"]){
        const now = new Date();
        const fileName = `bsProfile_${now.getTime()}.json`;

        downloadJSONFile(appState.latestFaceValues, fileName)

        appState.keys["y"] = false;
    }

    // TODO: Test
    if(appState.secondFaceModel !== undefined && appState.mainFaceModel !== undefined){
        rehabExercise(appState);

        appState.similarityScore = faceMatch(appState.latestFaceValues, appState.rehabEx.currentProfile)
    }
    
    // Modification du visage en temps réel
    faceSync(appState.mainFaceModel, appState.latestFaceValues, allSymSlidersValues);

    if(appState.secondFaceModel !== undefined){
        // TODO: Test
        appState.secondFaceModel.model.position.set(appState.mainFaceModel.model.position.x + 0.5, appState.mainFaceModel.model.position.y , appState.mainFaceModel.model.position.z)

        if(appState.rehabEx === undefined){
            faceSync(appState.secondFaceModel, {}, {})
        }
        else{
            faceSync(appState.secondFaceModel, appState.rehabEx.currentProfile, {})
        }

    }


    // Update debug
    debug.innerText = `Camera: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`;

    renderer.render(scene,camera)
}

animate()

