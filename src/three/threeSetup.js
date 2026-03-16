import * as THREE from 'three'

export function setupThree(){
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0000ff);

    const camera = new THREE.PerspectiveCamera(70,
        innerWidth/innerHeight,
        0.1,
        100)
    camera.position.set(0, 0.3, 0.5)

    const dirLight = new THREE.DirectionalLight(0xffffff, 6.0);
    dirLight.position.set(0, 1, 0);
    scene.add(dirLight);

    const spotlight = new THREE.DirectionalLight(0xffffff, 5.0);
    spotlight.position.set(0, 0.1, 0.2);
    spotlight.target.position.set(0, 0.1, 1);
    scene.add(spotlight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(innerWidth,innerHeight)
    document.body.appendChild(renderer.domElement)

    // Ajout de l'environnement de studio
    const material = new THREE.MeshStandardMaterial({
        color: 0x545454,
        roughness: 0.7,
        metalness: 0,
        side: THREE.DoubleSide
    });

    const floorGeometry = new THREE.PlaneGeometry(4, 4, 20, 20);
    const floor = new THREE.Mesh(floorGeometry, material);
    floor.rotation.x = - Math.PI / 2;

    const sphereGeometry = new THREE.SphereGeometry(1.25)
    const studioSphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(studioSphere);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(0, 1, 0);
    scene.add(sun);

    // ---------------------------------------------------------------------


    scene.add(floor)


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