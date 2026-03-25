// Module interne au projet
import { setupThree } from "./three/threeSetup";
import { setupControls } from "./three/controls";

import {loadFaceModel} from "./faceModel";

import { faceSync } from "./faceSync.js"
import { faceMatch } from "./faceMatch";

import { rehabExercise } from "./rehabExercise";

import {allSymSlidersValues, createLoadSymProfileButton, openSymControlsInterface} from "./ui/symmetrySlider";

import {
    appChoice,
    closeMainMenu,
    LIVE_LINK_CHOICE,
    REHABILITATION_CHOICE,
    SYMMETRY_CONTROLS_CHOICE
} from "./ui/mainMenu";


import {updateCamera} from "./three/camera";
import {downloadJSONFile} from "./utils/downloadFile";
import { updateAllSocketsStatus } from "./ui/socketStatus";
import {liveLinkBridgeDivIdGuide, openLiveLinkBridgeUI} from "./ui/liveLinkBridgeUI";

// -----------------------------------------------------
const downloadBSProfileInput = "y";

const appState = {
    keys: {},
    latestFaceValues: {},

    inApp: false,

    mainFaceModel: undefined,
    secondFaceModel: undefined,

    faceSyncResult: {},

    similarityScore: 0,

    rehabEx: undefined,

    fixPosition: true,

    debugMode: false,

    faceTrackerStatus: false,
    liveLinkBridgeStatus: false,
}

// THREE Setup - Construction de la scène
const {scene, camera, renderer, composer} = setupThree();
document.body.appendChild(renderer.domElement)
// ------------------------------------------------

// Construction des contrôles clavier/souris
setupControls(camera, appState, appState.fixPosition);


function loadApplication(){
    closeMainMenu();

    // Chargement du modèle de visage qui suit en temps réel les données du socket (et on le range dans appState, car asynchrone)
    loadFaceModel(scene, appState, true)    // Charge le modèle dans mainFaceModel

    // Chargement du bouton spécial de chargement de boutons
    const loadSymProfileCustomButton = createLoadSymProfileButton();

    if(appChoice  === REHABILITATION_CHOICE){
        loadFaceModel(scene, appState, false)   // Charge le modèle dans secondFaceModel

        loadSymProfileCustomButton.style.display = "block"

        loadSymProfileCustomButton.style.top = "92vh";
        loadSymProfileCustomButton.style.left = "3vw";

        document.title += " | " + REHABILITATION_CHOICE;
    }
    else if(appChoice === SYMMETRY_CONTROLS_CHOICE){
        openSymControlsInterface();

        document.title += " | " + SYMMETRY_CONTROLS_CHOICE;
    }
    else if(appChoice === LIVE_LINK_CHOICE){
        document.title += " | " + LIVE_LINK_CHOICE;

        loadSymProfileCustomButton.style.display = "block"
        openLiveLinkBridgeUI();

        document.getElementById(liveLinkBridgeDivIdGuide).appendChild(loadSymProfileCustomButton)

    }

    appState.inApp = true;
}


function downloadBSProfile(){
    const now = new Date();
    const fileName = `bsProfile_${now.getTime()}.json`;

    downloadJSONFile(appState.latestFaceValues, fileName)

    // On annule la pression de touche pour éviter de télécharger plusieurs fichiers
    appState.keys[downloadBSProfileInput] = false;
}


// Connexion au WebSocket (programme Python local (main.py dans le dossier tracker))
const ws = new WebSocket('ws://localhost:8080');
const wsBridge = new WebSocket('ws://localhost:8081');

ws.onopen = () => {
    appState.faceTrackerStatus = true;

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

ws.onclose = () => {
    appState.faceTrackerStatus = false;
    console.log('WebSocket fermé')
};

wsBridge.onopen  = () => {
    appState.liveLinkBridgeStatus = true;

    console.log('[Bridge] WebSocket :8081 connecté')
};
wsBridge.onerror = (e) => console.error('[Bridge] Erreur WebSocket :8081', e);

wsBridge.onclose = () => {
    appState.liveLinkBridgeStatus = false;
    console.log('[Bridge] WebSocket :8081 fermé');
};

// ---------------------------------------------------------------------------------


// Debug element
const debug = document.getElementById('debug');


function animate(){
    requestAnimationFrame(animate)

    updateCamera(camera, appState)

    if(!appState.inApp && appChoice !== undefined){
        loadApplication()
    }

    if(appState.inApp){
        updateAllSocketsStatus(appState)
    }

    if(appState.secondFaceModel !== undefined && appState.mainFaceModel !== undefined){
        rehabExercise(appState);

        const faceToCompare = (appState.faceSyncResult !== undefined) ? appState.faceSyncResult : appState.latestFaceValues;

        appState.similarityScore = faceMatch(faceToCompare, appState.rehabEx.currentProfile)
    }
    
    // Modification du visage en temps réel
    appState.faceSyncResult = faceSync(appState.mainFaceModel, appState.latestFaceValues, allSymSlidersValues);

    // Relire les valeurs finales depuis le mesh (post-symétrie)
    if (wsBridge.readyState === WebSocket.OPEN) {
        wsBridge.send(JSON.stringify(appState.faceSyncResult));
    }

    if(appState.secondFaceModel !== undefined){

        if(appState.rehabEx === undefined){
            faceSync(appState.secondFaceModel, {}, {})
        }
        else{
            faceSync(appState.secondFaceModel, appState.rehabEx.currentProfile, {})
        }

    }

    if(appState.debugMode){
        // Update debug
        debug.innerText = `Camera: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`;

        // Téléchargement en fichier des BS de la face courante
        if( appState.keys[downloadBSProfileInput]){
            downloadBSProfile()
        }

    }

    composer.render();
}

animate()