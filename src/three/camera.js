import * as THREE from "three";

export function updateCamera(camera, appState){

    let velocity = new THREE.Vector3(0, 0, 0);
    const cameraSpeed = 0.01

    // Modification du vecteur de déplacement
    if(appState.keys['z']) velocity.z -= cameraSpeed;
    if(appState.keys['s']) velocity.z += cameraSpeed;
    if(appState.keys['q']) velocity.x -= cameraSpeed;
    if(appState.keys['d']) velocity.x += cameraSpeed;

    if(appState.keys[' ']) velocity.y += cameraSpeed;
    if(appState.keys['a']) velocity.y -= cameraSpeed;

    // Appliquer le mouvement en respectant la rotation
    camera.translateX(velocity.x);
    camera.translateY(velocity.y);
    camera.translateZ(velocity.z);
}