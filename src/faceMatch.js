const response = await fetch('src/config/faceMapping.json');
const faceMapping = await response.json();

/**
 * La fonction permet de calculer un score de similarité entre deux profils de blendshapes ARKIT.
 * La fonction utilise le calcul de la similarité cosinus pondéré
 *
 * @param mainProfile Profil principal
 * @param referenceProfile Profil de référence
 **/
export function faceMatch(mainProfile, referenceProfile){

    let dotVector = 0;

    let normProfile = 0;
    let normReference = 0;

    let currentWeight;
    let mainValue;
    let referenceValue;
    for(let blendshape in faceMapping){
        currentWeight = faceMapping[blendshape].weight;

        mainValue = mainProfile[blendshape]
        referenceValue = referenceProfile[blendshape]

        if(mainValue !== undefined && referenceValue !== undefined){


            // Produit scalaire
            dotVector += currentWeight * mainValue * referenceValue;

            // Norm Main
            normProfile += currentWeight * mainValue * mainValue;

            // Norm reference
            normReference += currentWeight * referenceValue * referenceValue;
        }

   }

    return dotVector /(Math.sqrt(normProfile) * Math.sqrt(normReference));

}