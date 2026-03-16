function getBlendshapeCore(name) {

    if (name.endsWith('Left')) {
        return name.slice(0, -4); // enlève "Left"
    } else if (name.endsWith('Right')) {
        return name.slice(0, -5); // enlève "Right"
    } else {
        return name; // pas de Left/Right
    }

}

const response = await fetch('src/config/faceMapping.json');
const faceMapping = await response.json();


/**
 * La fonction permet d'altérer les détails morphologiques du visage selon le standard ARKIT.
 * Il est possible de symétriser une partie du visage.
 *
 * @param faceProfile Profil d'un modèle de visage FBX Three.Js compatible avec l'ARKIT
 * Le profil de visage contient les mesh du visage, de la mâchoire, de l'œil droit et gauche ainsi qu'un accès au modèle
 * complet
 *
 * @param {Object<string, number>} faceData Donne toutes les valeurs morphologiques du visage selon le standard ARKIT
 * @param {Object<string, number>} symmetricData Dictionnaire qui associe à chaque blendshapes symétrisasse de l'ARKIT
 * une valeur qui indique s'il est nécessaire de faire une symétrie. 0 = Neutre, -1 = On symétrise à partir de la partie
 * gauche du visage, 1 = On symétrise à partir de la partie droite du visage
 **/
export function faceSync(faceProfile, faceData, symmetricData = {}){

    let finalState = {}

    // Récupération des mesh du profil
    let faceMesh = faceProfile.head;

    let jawMesh = faceProfile.jaw;

    let rightEye = faceProfile.rightEye;

    let leftEye = faceProfile.leftEye;

    if(faceMesh === undefined){
        // console.error("Le profil de visage doit au moins contenir un mesh de tête (head) avec les morphTargetDictionary correctement renseignés.");
        return;
    }

    // On attribue ensuite les valeurs dans un premier temps au visage en priorité en suivant les éventuelles symétries
    for(let key in faceData){

        // Indique s'il est nécessaire d'appliquer la valeur courante du visage au modèle
        let standardKeyApplication = true;
        let validSymmetry = false;


        if(faceData.hasOwnProperty(key) && faceMapping.hasOwnProperty(key)){

            if(true){
                // Si la table des symétries est non vide alors, on se prépare à symétriser des éléments

                if(key.includes("Left") || key.includes("Right")){
                    // Nous sommes face à un élément qui a un symétrique
                    const baseBSName = getBlendshapeCore(key);

                    if(symmetricData[baseBSName] !== 0 && symmetricData[baseBSName] !== undefined){
                        if(symmetricData[baseBSName] === 1 && key.includes("Right")){
                            validSymmetry = true;
                        }
                        else if(symmetricData[baseBSName] === -1 && key.includes("Left")){
                            validSymmetry = true;
                        }
                        else{
                            standardKeyApplication = false;
                        }
                    }


                }
            }

            if(standardKeyApplication){
                // On applique la valeur à l'élément courant du visage
                finalState[key] = faceData[key]
                faceMesh.morphTargetInfluences[faceMesh.morphTargetDictionary[key]] = faceData[key];


                if(validSymmetry){
                    // On applique la valeur à l'élément symétrique du visage
                    faceMesh.morphTargetInfluences[faceMesh.morphTargetDictionary[faceMapping[key].linkSymmetry]] = faceData[key];
                }
            }

        }
    }


    // Puis, on applique rétroactivement aux autres mesh les valeurs du visage (car elle hérite des valeurs du visage).
    if(jawMesh !== undefined){
        for(let key in jawMesh.morphTargetDictionary){
            jawMesh.morphTargetInfluences[jawMesh.morphTargetDictionary[key]] = faceMesh.morphTargetInfluences[faceMesh.morphTargetDictionary[key]];
        }
    }

    if(rightEye !== undefined){
        for(let key in rightEye.morphTargetInfluences){
            rightEye.morphTargetInfluences[key] = faceMesh.morphTargetInfluences[key];
        }
    }

    if(leftEye !== undefined){
        for(let key in leftEye.morphTargetInfluences){
            leftEye.morphTargetInfluences[key] = faceMesh.morphTargetInfluences[key];
        }
    }

    if(faceData.hasOwnProperty("headYaw") && faceData.hasOwnProperty("headRoll") && faceData.hasOwnProperty("headPitch")){

        // Appliquer directement la rotation à la tête du personnage

        // TODO

        //headGroup.rotation.y = faceData.headYaw;   // Yaw
        //headGroup.rotation.x = faceData.headPitch; // Pitch
        //headGroup.rotation.z = faceData.headRoll;  // Roll
    }

}


