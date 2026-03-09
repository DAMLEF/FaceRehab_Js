import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'



const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0000ff);



const camera = new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.1,100)
camera.position.set(0, 1.5, 1.5)


const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5,5,5)
scene.add(light)

const ambient = new THREE.AmbientLight(0x404040, 1)
scene.add(ambient)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth,innerHeight)
document.body.appendChild(renderer.domElement)

const loader = new FBXLoader()


// Ajout d'un sol pour référence
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
//scene.add(floor);

// Key press listeners

const rotationSpeed = 0.01;
let prevMouse = {x:0,y:0};
let isMouseDown = false;


window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

document.addEventListener('mousedown', e=>{ isMouseDown=true; prevMouse.x=e.clientX; prevMouse.y=e.clientY; });
document.addEventListener('mouseup', e=>{ isMouseDown=false; });
document.addEventListener('mousemove', e => {
    if(!isMouseDown) return;
    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;


    // créer un quaternion pour la rotation verticale (pitch) autour de l'axe X local
    const qx = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(1,0,0), -deltaY*rotationSpeed);

    // créer un quaternion pour la rotation horizontale (yaw) autour de l'axe Y global
    const qy = new THREE.Quaternion();
    qy.setFromAxisAngle(new THREE.Vector3(0,1,0), -deltaX*rotationSpeed);

    // appliquer la rotation: yaw d'abord, puis pitch
    camera.quaternion.multiplyQuaternions(qy, camera.quaternion);
    camera.quaternion.multiply(qx);


    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
});



let meshDictionary = {};
let faceMesh = null;
let headGroup = null;
let latestFaceValues = {}; // Stocke les dernières valeurs reçues via WebSocket
loader.load("model.fbx",(fbx)=>{
    scene.add(fbx)
    fbx.position.set(0,0,0)
    fbx.scale.set(0.01,0.01,0.01)  // réduire si le modèle est énorme

    fbx.traverse(child => {
        console.log(child.type, child.name);

        if(child.name === "grp_head"){
            headGroup = child;
        }

        if(child.isMesh || child.isSkinnedMesh){
            console.log("Found mesh:", child.name);
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


const response = await fetch('faceMapping.json');
const faceMapping = await response.json();


console.log(faceMapping);

/**
 * La fonction permet d'altérer les détails morphologiques du visage selon le standard ARKIT.
 * Il est possible de symétriser une partie du visage.
 * @param {Object<string, number>} faceData Donne toutes les valeurs morphologiques du visage selon le standard ARKIT
 * @param {boolean} needSymmetry Booléen qui demande s'il est nécessaire de symétriser le visage
 * @param {boolean} symmetricSide Si ce paramètre est à false alors, on considère que le côté gauche du visage est le modèle
 * et si le paramètre est à true, il s'agit du côté droit que l'on prend comme modèle
 **/
function faceSync(faceData, needSymmetry = false, symmetricSide = false){

    for(let key in faceData){
        if(faceData.hasOwnProperty(key) && faceMapping.hasOwnProperty(key)){
            faceMesh.morphTargetInfluences[faceMesh.morphTargetDictionary[key]] = faceData[key];
        }
    }

    if(faceData.hasOwnProperty("headYaw") && faceData.hasOwnProperty("headRoll") && faceData.hasOwnProperty("headPitch")){

        // Appliquer directement la rotation à la tête du personnage

        //headGroup.rotation.y = faceData.headYaw;   // Yaw
        //headGroup.rotation.x = faceData.headPitch; // Pitch
        //headGroup.rotation.z = faceData.headRoll;  // Roll
    }

}



// 1️⃣ Connexion WebSocket
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('WebSocket connecté');
};


ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        // On met juste à jour l'état, on n'applique pas directement
        latestFaceValues = data;
    } catch (e) {
        console.error('Erreur JSON WebSocket', e);
    }
};

ws.onclose = () => console.log('WebSocket fermé');

// Debug element
const debug = document.getElementById('debug');

// Camera movement parameters
const moveSpeed = 0.05;
const keys = {};
let velocity = new THREE.Vector3(0, 0, 0);

function animate(){
    requestAnimationFrame(animate)

    velocity.set(0, 0, 0);
    const speed = 0.04

    if(keys['z']) velocity.z -= speed;
    if(keys['s']) velocity.z += speed;
    if(keys['q']) velocity.x -= speed;
    if(keys['d']) velocity.x += speed;

    // Appliquer le mouvement en respectant la rotation
    camera.translateX(velocity.x);
    camera.translateY(velocity.y);
    camera.translateZ(velocity.z);


    // Update debug
    debug.innerText = `Camera: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`;

    // Test expressions FBX
    faceSync(latestFaceValues)

    renderer.render(scene,camera)
}

animate()

