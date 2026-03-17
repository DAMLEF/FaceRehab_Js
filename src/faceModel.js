import * as THREE from "three";

import {FBXLoader} from "three/addons/loaders/FBXLoader";


const fbxLoader = new FBXLoader()
const textureLoader = new THREE.TextureLoader();

// Gestion de la structure du modèle de visage compatible ARKIT
const faceModelFileName = "assets/models/model.fbx"

const faceModelHeadMeshName = "head_lod0_ORIGINAL"

const faceModelJawMeshName = "teeth_ORIGINAL"
const faceModelRightEyeMeshName = "eyeRight_ORIGINAL"
const faceModelLeftEyeMeshName = "eyeLeft_ORIGINAL"

// Gestion des textures du modèle
const faceHeadTextureFileName = "assets/textures/head_base.png"
const faceHeadNormalTextureFileName = "assets/textures/head_normal.png"
const faceHeadRoughnessTextureFileName = "assets/textures/head_Roughness.png"
const eyeTextureFileName = "assets/textures/eyeL_base.png"
const eyeNormalTextureFileName = "assets/textures/eyeL_normal.png"
const teethTextureFileName = "assets/textures/teeth_base.png"
const teethNormalTextureFileName = "assets/textures/teeth_normal.png"
const teethRoughnessTextureFileName = "assets/textures/teeth_Roughness.png"

const headTexture = textureLoader.load(faceHeadTextureFileName);
const headNormalTexture = textureLoader.load(faceHeadNormalTextureFileName);
const headRoughTexture = textureLoader.load(faceHeadRoughnessTextureFileName);
const eyeTexture = textureLoader.load(eyeTextureFileName);
const eyeNormalTexture = textureLoader.load(eyeNormalTextureFileName);
const teethTexture = textureLoader.load(teethTextureFileName);
const teethNormalTexture = textureLoader.load(teethNormalTextureFileName);
const teethRoughnessTexture = textureLoader.load(teethRoughnessTextureFileName);

headTexture.colorSpace = THREE.SRGBColorSpace;

// Transform relatif au modèle
const relativePos  = new THREE.Vector3(-0.25, -1.35, 0)
const relativeScale = new THREE.Vector3(0.01, 0.01, 0.01)

export function loadFaceModel(scene, appState, debug = false){

    // Définition des mesh du visage nécessaire pour la synchronisation
    let faceMesh = undefined

    let jawMash = undefined

    let rightEyeMesh = undefined
    let leftEyeMesh = undefined

    let completeModel = undefined

    // Chargement du modèle
    fbxLoader.load(faceModelFileName, (fbxModel) => {

        completeModel = fbxModel

        // On ajoute à la scène le modèle
        scene.add(fbxModel);

        // Gestion de son positionnement
        fbxModel.position.set(relativePos.x, relativePos.y, relativePos.z);
        fbxModel.scale.set(relativeScale.x, relativeScale.y, relativeScale.z);

        if(debug){
            console.log("[REHAB] 😀 Chargement du modèle de visage ")
        }

        // On parcourt les enfants du modèle pour trouver les mesh compatible ARKIT
        fbxModel.traverse(child => {

            if(debug){
                console.log("[REHAB] - Enfant du modèle : " + child.type + " " + child.name);
            }

            if(child.isMesh || child.isSkinnedMesh){

                if(debug){
                    console.log("[REHAB] \t - Mesh : " + child.name);

                    if(child.morphTargetInfluences){
                        console.log("[REHAB] \t\t - Mesh Target influences : ");
                        console.log(child.morphTargetDictionary)
                    }
                }

                // On récupère les mesh particulier pour les ranger dans leur variable

                // Mesh de la tête
                if( child.name === faceModelHeadMeshName){
                    // On stocke le faceMesh
                    faceMesh = child;

                    // On applique la texture de la tête
                    faceMesh.material = new THREE.MeshStandardMaterial({
                        map:          headTexture,
                        normalMap:    headNormalTexture,
                        roughnessMap: headRoughTexture,

                        color:     0xffffff,
                        metalness:    0.0,
                    });
                }

                // Mesh de la mâchoire
                if( child.name === faceModelJawMeshName){
                    jawMash = child;

                    child.material = new THREE.MeshStandardMaterial({
                        map:          teethTexture,
                        normalMap:    teethNormalTexture,
                        roughnessMap: teethRoughnessTexture,

                        color:     0xbbbbbb,
                        metalness:    0.0,
                    });

                }

                // Mesh de l'œil droit
                if( child.name === faceModelRightEyeMeshName ){
                    rightEyeMesh = child;

                    child.material = new THREE.MeshStandardMaterial({
                        map:          eyeTexture,
                        normalMap:    eyeNormalTexture,
                        color:     0xbbbbbb,
                        roughness:    0.3,
                        metalness:    0.0,
                    });
                }

                // Mesh de l'oeil gauche
                if( child.name === faceModelLeftEyeMeshName ){
                    leftEyeMesh = child;

                    child.material = new THREE.MeshStandardMaterial({
                        map:          eyeTexture,
                        normalMap:    eyeNormalTexture,
                        color:     0xbbbbbb,
                        roughness:    0.3,
                        metalness:    0.0,
                    });
                }

            }

        
        
        })

        const faceProfile = {head: faceMesh, jaw: jawMash, leftEye: leftEyeMesh, rightEye: rightEyeMesh, model: completeModel};

        if(appState.mainFaceModel === undefined){
            appState.mainFaceModel = faceProfile;
        }
        else{
            appState.secondFaceModel = faceProfile;
        }

    })



    return {head: faceMesh, jaw: jawMash, leftEye: leftEyeMesh, rightEye: rightEyeMesh, model: completeModel};
}