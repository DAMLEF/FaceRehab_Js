import * as THREE from 'three'

export function setupThree(){
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0000ff);

    const camera = new THREE.PerspectiveCamera(70,
        innerWidth/innerHeight,
        0.1,
        100)
    camera.position.set(0, 1.55, 0.5)

    const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight.position.set(1, 2, 2);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(innerWidth,innerHeight)
    document.body.appendChild(renderer.domElement)

    // Resize de la fenêtre en temps réel
    window.addEventListener("resize", () => {onWindowResize(camera, renderer)});

    return {scene, camera, renderer}
}

function onWindowResize(camera, renderer) {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}