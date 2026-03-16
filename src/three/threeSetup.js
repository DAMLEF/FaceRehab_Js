import * as THREE from 'three'
import { TAARenderPass } from 'three/addons/postprocessing/TAARenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

function addSpotlight(scene, color, intensity, position, target, angle, penumbra, distance = 0) {
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(...position);
    light.target.position.set(...target);
    light.angle = angle;
    light.penumbra = penumbra;
    if (distance) light.distance = distance;
    scene.add(light);
    scene.add(light.target);
    return light;
}

export function setupThree(){
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0000ff);

    const camera = new THREE.PerspectiveCamera(
        20,                     // field of view (degrees)
        innerWidth/innerHeight, // aspect ratio
        0.01,                    // near clipping plane
        100                     // far clipping plane
    )
    camera.position.set(0, 0.25, 1.8)

    const dirLight = new THREE.DirectionalLight(0xff0022, 0.0);
    dirLight.position.set(1, 1, 0);
    scene.add(dirLight);

    

    // blue backlight
    addSpotlight(scene, 0x00000ff, 20.0, [-1.5, 0.1, -0.5], [0.5, 0.1, -10], Math.PI / 3, 1.0);

    addSpotlight(scene, 0xff00000, 20.0, [1.5, 0.1, -0.5], [-0.5, 0.1, -10], Math.PI / 3, 1.0);

    addSpotlight(scene, 0xeebbee, 20.0, [0, 0.1, -0.5], [0, 0.1, -10], Math.PI / 3, 1.0);

    
    // ---- MODEL A (left, centered at -0.25, 0.25, 0) ----

    // Key light - top left front
    addSpotlight(scene, 0xffffff, 100.0, [-2.0, 2.0, 2.0], [-0.25, 0.25, 0],  Math.PI / 35, 0.3, 5);

    // Edge/rim light - top back left
    addSpotlight(scene, 0xffffff, 10.0, [-1.0, 1.2, -1.0], [-0.25, 0.25, 0],  Math.PI / 4, 0.2, 2);

    // Accent - red bottom right
    addSpotlight(scene, 0xff1133, 1.0,  [0.1, -0.1, 0.2],  [-0.25, 0.1, 0],  Math.PI / 6, 0.8, 1.4);

    // Accent - blue bottom left
    addSpotlight(scene, 0x2233ff, 4.0,  [-0.6, -0.1, 0.2], [-0.25, 0.1, 0],  Math.PI / 6, 0.8, 1.4);

    
    // ---- MODEL B (right, centered at 0.25, 0.25, 0) ----

    // Key light - top left front
    addSpotlight(scene, 0xffffff, 100.0, [-1.5, 2.0, 2.0],  [0.25, 0.25, 0],  Math.PI / 35, 0.3, 5);

    // Edge/rim light - top back right
    addSpotlight(scene, 0xffffff, 10.0,  [-0.5, 1.2, -1.0], [0.25, 0.25, 0],  Math.PI / 4,  0.2, 2);

    // Accent - red bottom left
    addSpotlight(scene, 0xff1133, 1.0,   [0.6, -0.1, 0.2], [0.25, 0.1, 0],  Math.PI / 6,  0.8, 1.4);

    // Accent - blue bottom right
    addSpotlight(scene, 0x2233ff, 4.0,   [-0.1, -0.1, 0.2], [0.25, 0.1, 0],  Math.PI / 6,  0.8, 1.4);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(innerWidth,innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // or THREE.NoToneMapping
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement)

    // TAA composer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const taaPass = new TAARenderPass(scene, camera);
    taaPass.sampleLevel = 2; // 4 samples
    composer.renderTarget1.texture.colorSpace = THREE.SRGBColorSpace;
    composer.renderTarget2.texture.colorSpace = THREE.SRGBColorSpace;
    composer.addPass(taaPass);

    // Ajout de l'environnement de studio
    const material = new THREE.MeshStandardMaterial({
        color: 0x545454,
        roughness: 0.7,
        metalness: 0,
        side: THREE.DoubleSide
    });

    const sphereGeometry = new THREE.SphereGeometry(2)
    sphereGeometry.translate(0, 0.2, 0);
    const studioSphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(studioSphere);

    // Resize de la fenêtre en temps réel
    window.addEventListener("resize", () => {onWindowResize(camera, renderer)});

    return {scene, camera, renderer, composer}
}

function onWindowResize(camera, renderer) {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}