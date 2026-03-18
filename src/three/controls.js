import * as THREE from "three";

export function setupControls(camera, appState){

    // Contrôle du clavier
    window.addEventListener('keydown', e => appState.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => appState.keys[e.key.toLowerCase()] = false);


    // Contrôle de la souris
    const rotationSpeed = 0.01;

    let prevMouse = {x:0,y:0};
    let isMouseDown = false;

    document.addEventListener('mousedown', e=>{
        isMouseDown = true;
        prevMouse.x = e.clientX;
        prevMouse.y = e.clientY;
    });

    document.addEventListener('mouseup', ()=>{
        isMouseDown = false;
    });

    if(!appState.fixPosition){
        document.addEventListener('mousemove', e=>{

            if(!isMouseDown) return;

            const deltaX = e.clientX - prevMouse.x;
            const deltaY = e.clientY - prevMouse.y;

            const qx = new THREE.Quaternion();
            qx.setFromAxisAngle(new THREE.Vector3(1,0,0), -deltaY*rotationSpeed);

            const qy = new THREE.Quaternion();
            qy.setFromAxisAngle(new THREE.Vector3(0,1,0), -deltaX*rotationSpeed);

            camera.quaternion.multiplyQuaternions(qy, camera.quaternion);
            camera.quaternion.multiply(qx);

            prevMouse.x = e.clientX;
            prevMouse.y = e.clientY;
        });
    }


}