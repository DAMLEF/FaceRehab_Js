import * as THREE from 'three'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'


// Module interne au projet
import {setupThree} from "./three/threeSetup";
import { setupControls } from "./three/controls";

import {faceSync} from "./faceSync.js"


import {allSymSlidersValues} from "./ui/symmetrySlider";
import {updateCamera} from "./three/camera";

// -----------------------------------------------------

const appState = {
    keys: {}
}

// THREE Setup - Construction de la scène
const {scene, camera, renderer} = setupThree();
document.body.appendChild(renderer.domElement)
// ------------------------------------------------

// Construction des contrôles clavier/souris
setupControls(camera, appState);

const loader = new FBXLoader()
const textureLoader = new THREE.TextureLoader();


let meshDictionary = {};
let faceMesh = null;
let latestFaceValues = {}; // Stocke les dernières valeurs reçues via WebSocket
loader.load("assets/models/model.fbx",(fbx)=>{
    const baseColor   = textureLoader.load("assets/textures/head_base.png");
    baseColor.colorSpace = THREE.SRGBColorSpace; 
    
    scene.add(fbx)
    fbx.position.set(0,0,0)
    fbx.scale.set(0.01,0.01,0.01)  // réduire si le modèle est énorme
    
    fbx.traverse(child => {
        console.log(child.type, child.name);
        if(child.isMesh || child.isSkinnedMesh){
            
            console.log("Found mesh:", child.name);
            
            if(child.name === "head_lod0_ORIGINAL"){
                child.material = new THREE.MeshStandardMaterial({
                    map:          baseColor,
                    color:     0xffffff,
                    roughness:    0.6,
                    metalness:    0.0,
                });
            }

            if(child.name === "teeth_ORIGINAL"){
                child.material = new THREE.MeshStandardMaterial({
                    color:     0xaaaaaa,
                    roughness:    0.6,
                    metalness:    0.0,
                });
            }

            
            child.material.needsUpdate = true;

            if(child.morphTargetInfluences){
                console.log("Morph targets:", child.morphTargetDictionary);

                if(child.name === "head_lod0_ORIGINAL"){
                    faceMesh = child;
                }
                meshDictionary[child.name] = child;
            }
        }
    });
    

})










// Connexion WebSocket
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('WebSocket connecté');
};


ws.onmessage = (event) => {
    try {
        // On met juste à jour l'état, on n'applique pas directement
        latestFaceValues = JSON.parse(event.data);
    } catch (e) {
        console.error('Erreur JSON WebSocket', e);
    }
};

ws.onclose = () => console.log('WebSocket fermé');

// Debug element
const debug = document.getElementById('debug');


function animate(){
    requestAnimationFrame(animate)

    updateCamera(camera, appState)

    // Modification du visage en temps réel
    faceSync(faceMesh, latestFaceValues, allSymSlidersValues);


    // Update debug
    debug.innerText = `Camera: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`;

    renderer.render(scene,camera)
}

animate()

