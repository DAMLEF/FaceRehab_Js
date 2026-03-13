import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const loader = new OBJLoader();


// Dictionnaire ARKit BlendShape -> Index Point Pilote MediaPipe
const arkitToMediaPipeMap = {
    // --- Mâchoire & Bouche ---
    "jawOpen": 13,          // Centre du menton
    "jawLeft": 132,         // Côté gauche de la mâchoire
    "jawRight": 361,        // Côté droit de la mâchoire
    "mouthSmileLeft": 61,   // Commissure gauche
    "mouthSmileRight": 291, // Commissure droite
    "mouthPucker": 0,       // Centre des lèvres (haut)
    "mouthFunnel": 17,      // Centre des lèvres (bas)
    // --- Yeux & Paupières ---
    "eyeBlinkLeft": 159,    // Centre paupière supérieure gauche
    "eyeBlinkRight": 386,   // Centre paupière supérieure droite
    "eyeLookUpLeft": 159,   // (Utilise souvent le même point que Blink)
    // --- Sourcils ---
    "browDownLeft": 107,    // Intérieur sourcil gauche
    "browOuterUpLeft": 70,  // Extérieur sourcil gauche
    // ... et ainsi de suite pour les 52 shapes.
};


// 1. Initialisation de la scène, caméra, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 2);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Controls pour pouvoir tourner autour
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Charge le modèle de référence de MediaPipe (les 468 points)
loader.load('https://raw.githubusercontent.com/google/mediapipe/master/mediapipe/modules/face_geometry/data/canonical_face_model.obj', (object) => {

    object.traverse((child) => {
        if (child.isMesh) {
            // Configuration du Wireframe "Ultra Clair"
            child.material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
                transparent: true,
                opacity: 0.5
            });

            // Si tu veux aussi voir les points (les sommets)
            const pointsBuffer = child.geometry.clone();
            const dotMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.005 });
            const points = new THREE.Points(pointsBuffer, dotMaterial);

            //scene.add(child);  // Le maillage (lignes)
            //scene.add(points); // Les points (sommets)
        }
    });
});


const url = 'https://raw.githubusercontent.com/google/mediapipe/master/mediapipe/modules/face_geometry/data/canonical_face_model.obj';

const arkitIndices = [
    // Bouche (20 points)
    0, 13, 14, 17, 37, 39, 40, 61, 78, 80, 81, 82, 84, 87, 88, 91, 95, 146, 178, 181,
    // Yeux et paupières (16 points)
    33, 133, 157, 158, 159, 160, 161, 163, 263, 362, 384, 385, 386, 387, 388, 390,
    // Sourcils (10 points)
    46, 52, 53, 63, 65, 70, 105, 107, 276, 282,
    // Nez et Joues (6 points)
    1, 2, 4, 5, 123, 352
];

const arkitToMediaPipe = {
    // --- EYE (Yeux) ---
    "eyeBlinkLeft": 159, "eyeLookDownLeft": 145, "eyeLookInLeft": 133, "eyeLookOutLeft": 33, "eyeLookUpLeft": 158, "eyeSquintLeft": 144, "eyeWideLeft": 160,
    "eyeBlinkRight": 386, "eyeLookDownRight": 374, "eyeLookInRight": 362, "eyeLookOutRight": 263, "eyeLookUpRight": 385, "eyeSquintRight": 373, "eyeWideRight": 387,

    // --- JAW (Mâchoire) ---
    "jawForward": 199, "jawLeft": 202, "jawOpen": 13, "jawRight": 422,

    // --- MOUTH (Bouche) ---
    "mouthClose": 14, "mouthFunnel": 17, "mouthPucker": 0, "mouthLeft": 61, "mouthRight": 291,
    "mouthSmileLeft": 61, "mouthSmileRight": 291, "mouthFrownLeft": 91, "mouthFrownRight": 321,
    "mouthDimpleLeft": 206, "mouthDimpleRight": 426, "mouthStretchLeft": 216, "mouthStretchRight": 436,
    "mouthRollLower": 14, "mouthRollUpper": 13, "mouthShrugLower": 311, "mouthShrugUpper": 81,
    "mouthPressLeft": 216, "mouthPressRight": 436, "mouthLowerDownLeft": 178, "mouthLowerDownRight": 402,
    "mouthUpperUpLeft": 37, "mouthUpperUpRight": 267,

    // --- BROW (Sourcils) ---
    "browDownLeft": 107, "browDownRight": 336, "browInnerUp": 9, "browOuterUpLeft": 70, "browOuterUpRight": 300,

    // --- CHEEK & NOSE (Joues et Nez) ---
    "cheekPuff": 205, "cheekSquintLeft": 123, "cheekSquintRight": 352,
    "noseSneerLeft": 198, "noseSneerRight": 420,

    // --- TONGUE (Langue - souvent non supporté en point fixe, on met un point central) ---
    "tongueOut": 13
};

loader.load(url, (object) => {
    let faceMesh;

    object.traverse((child) => {
        if (child.isMesh) {
            faceMesh = child;
            // On rend le visage discret (wireframe gris)
            child.material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
                transparent: true,
                opacity: 0.9
            });
        }
    });

    if (faceMesh && false) {
        scene.add(faceMesh);

        const positions = faceMesh.geometry.attributes.position;
        const sphereGeom = new THREE.SphereGeometry(0.25, 24, 24); // Très petites sphères
        const sphereMat = new THREE.MeshBasicMaterial({color: 0xff0000}); // Rouge

        // On place les 52 points rouges
        arkitIndices.forEach((index) => {
            const tempVec = new THREE.Vector3();
            tempVec.fromBufferAttribute(positions, index);

            const redPoint = new THREE.Mesh(sphereGeom, sphereMat);
            redPoint.position.copy(tempVec);

            // On l'ajoute au mesh pour qu'il soit lié au visage
            faceMesh.add(redPoint);
        });
    }

    if (faceMesh) {
        scene.add(faceMesh);
        const positions = faceMesh.geometry.attributes.position;

        // On crée une petite sphère rouge réutilisable
        const sphereGeom = new THREE.SphereGeometry(0.25, 8, 8);
        const sphereMat = new THREE.MeshBasicMaterial({color: 0xff0000});

        // Parcours des 52 Blendshapes
        Object.entries(arkitToMediaPipe).forEach(([name, index]) => {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positions, index);

            const point = new THREE.Mesh(sphereGeom, sphereMat);
            point.position.copy(vertex);

            // On stocke le nom de la blendshape dans l'objet pour ton système de modification
            point.name = name;
            point.userData.arkitName = name;

            faceMesh.add(point);
        });

    }

});


// --- 1. CRÉATION D'UN VISAGE DE RÉFÉRENCE RAPIDE ---
// On crée une sphère et on l'étire pour qu'elle ressemble vaguement à un visage.
// C'est notre support pour les points rouges.
const faceGeometry = new THREE.SphereGeometry(0.5, 32, 32);
// Déformation pour allonger le visage
faceGeometry.scale(0.8, 1.2, 0.7);

const faceMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true, // Wireframe pour le style
    transparent: false,
    opacity: 0.8
});
const faceModel = new THREE.Mesh(faceGeometry, faceMaterial);
//scene.add(faceModel);


// --- 2. DÉFINITION DES 52 POINTS D'INTÉRÊT (RELATIFS AU VISAGE) ---
// Voici un tableau de coordonnées (x, y, z) approximatives pour les zones clés.
// Tu peux ajuster ces coordonnées pour qu'elles correspondent parfaitement à tes besoins.
const pointsOfInterest = [
    // --- Front et Sourcils (7 points) ---
    { x: 0, y: 0.6, z: 0.2 },       // Front centre
    { x: -0.2, y: 0.55, z: 0.25 }, // Sourcil gauche intérieur
    { x: -0.35, y: 0.55, z: 0.2 }, // Sourcil gauche centre
    { x: -0.45, y: 0.5, z: 0.1 },  // Sourcil gauche extérieur
    { x: 0.2, y: 0.55, z: 0.25 },  // Sourcil droit intérieur
    { x: 0.35, y: 0.55, z: 0.2 },  // Sourcil droit centre
    { x: 0.45, y: 0.5, z: 0.1 },   // Sourcil droit extérieur

    // --- Yeux et Paupières (12 points) ---
    { x: -0.2, y: 0.3, z: 0.25 },  // Coin interne œil gauche
    { x: -0.3, y: 0.35, z: 0.28 }, // Paupière sup gauche centre
    { x: -0.4, y: 0.3, z: 0.22 },  // Coin externe œil gauche
    { x: -0.3, y: 0.25, z: 0.28 }, // Paupière inf gauche centre
    { x: 0.2, y: 0.3, z: 0.25 },   // Coin interne œil droit
    { x: 0.3, y: 0.35, z: 0.28 },  // Paupière sup droit centre
    { x: 0.4, y: 0.3, z: 0.22 },   // Coin externe œil droit
    { x: 0.3, y: 0.25, z: 0.28 },  // Paupière inf droit centre
    { x: -0.3, y: 0.3, z: 0.3 },   // Pupille gauche
    { x: 0.3, y: 0.3, z: 0.3 },    // Pupille droite

    // --- Nez (5 points) ---
    { x: 0, y: 0.3, z: 0.35 },      // Arête du nez
    { x: 0, y: 0.1, z: 0.4 },       // Pointe du nez
    { x: -0.1, y: 0.05, z: 0.35 }, // Narine gauche
    { x: 0.1, y: 0.05, z: 0.35 },  // Narine droite

    // --- Bouche et Lèvres (16 points) ---
    { x: -0.25, y: -0.1, z: 0.3 },  // Commissure gauche
    { x: 0.25, y: -0.1, z: 0.3 },   // Commissure droite
    { x: 0, y: -0.05, z: 0.35 },    // Arc de Cupidon centre
    { x: -0.1, y: -0.05, z: 0.35 }, // Lèvre sup gauche
    { x: 0.1, y: -0.05, z: 0.35 },  // Lèvre sup droite
    { x: 0, y: -0.2, z: 0.35 },     // Lèvre inf centre
    { x: -0.1, y: -0.2, z: 0.35 },  // Lèvre inf gauche
    { x: 0.1, y: -0.2, z: 0.35 },   // Lèvre inf droite
    { x: -0.15, y: -0.12, z: 0.32 },// Intérieur lèvre sup gauche
    { x: 0.15, y: -0.12, z: 0.32 }, // Intérieur lèvre sup droite
    { x: 0, y: -0.12, z: 0.35 },    // Intérieur lèvre sup centre
    { x: -0.15, y: -0.18, z: 0.32 },// Intérieur lèvre inf gauche
    { x: 0.15, y: -0.18, z: 0.32 }, // Intérieur lèvre inf droite
    { x: 0, y: -0.18, z: 0.35 },    // Intérieur lèvre inf centre

    // --- Mâchoire et Menton (7 points) ---
    { x: 0, y: -0.4, z: 0.3 },      // Centre du menton
    { x: -0.2, y: -0.38, z: 0.25 }, // Mâchoire gauche avant
    { x: 0.2, y: -0.38, z: 0.25 },  // Mâchoire droite avant
    { x: -0.4, y: -0.2, z: 0.1 },   // Mandibule gauche arrière
    { x: 0.4, y: -0.2, z: 0.1 },    // Mandibule droite arrière

    // --- Joues (4 points) ---
    { x: -0.3, y: 0.1, z: 0.2 },    // Joue gauche haut
    { x: 0.3, y: 0.1, z: 0.2 },     // Joue droite haut
    { x: -0.35, y: -0.1, z: 0.2 },  // Joue gauche bas
    { x: 0.35, y: -0.1, z: 0.2 }    // Joue droite bas
];


// --- 3. CRÉATION ET PLACEMENT DES SPHÈRES ROUGES ---
// Configuration des sphères rouges
const pointGeometry = new THREE.SphereGeometry(0.015, 8, 8); // Petite taille
const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Rouge uni

// On boucle sur notre tableau de positions pour créer chaque point
pointsOfInterest.forEach(pos => {
    const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
    // On place le point à la coordonnée définie
    pointMesh.position.set(pos.x, pos.y, pos.z);
    // On l'ajoute comme enfant du modèle de visage pour qu'il suive ses mouvements
    faceModel.add(pointMesh);
});







// 7. Boucle d'animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// 8. Adaptation à la taille fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
