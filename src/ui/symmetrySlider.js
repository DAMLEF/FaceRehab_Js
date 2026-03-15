import symmetricBlendshapes from '/src/config/symmetricBlendshapes.json' with { type: 'json' };
import { getHTMLTemplate } from "../utils/getHTMLTemplate";

const symSliderTemplateHTML = await fetch("src/templates/symmetrySlider.html").then(r => r.text());
const symSliderControlTemplateHTML = await fetch("src/templates/symmetrySliderControl.html").then(r => r.text());


const symSlidersDivId = "symSliders";

const symSlidersControlsDivId = "symSlidersControls";

export let allSymSlidersValues = {}
let allSymSliders = {}

let allSymSlidersControls = {}

// Création des Sliders
function createSymSlider(name) {
    // Rangement de la div dans la variable slider
    const slider = getHTMLTemplate(symSliderTemplateHTML);

    // On change le nom du slider
    const sliderParamP = slider.children[0];
    sliderParamP.innerText = name;


    // On ajoute le slider sur la page et on garde en mémoire le résultat du paramètre
    document.getElementById(symSlidersDivId).appendChild(slider);
    allSymSlidersValues[name] = 0;

    // On ajoute un listener sur l'input qui met à jour le paramètre dans le tableau
    const inputDiv = slider.children[1];
    const sliderInput = inputDiv.children[1];

    sliderInput.addEventListener('input', () => {
        allSymSlidersValues[name] = parseInt(sliderInput.value);
    })

    // On stocke tous les Inputs dans un tableau pour agir dessus par la suite
    allSymSliders[name] = sliderInput;
}

// Création des Boutons de contrôle sur tous les sliders en même temps
function createSymSliderControl(name){
    const button = getHTMLTemplate(symSliderControlTemplateHTML);

    button.innerText = name;

    document.getElementById(symSlidersControlsDivId).appendChild(button);

    allSymSlidersControls[name] = button;

    return button;
}

// Téléchargement du profil symétrique de l'utilisateur
function downloadSymProfile(){
    // On définit nos données JSON pour le profil
    const profile = JSON.stringify(allSymSlidersValues, null, 2);

    // On crée l'objet BLOB
    const blobObj = new Blob([profile], { type: "application/json" });
    const urlProfile = URL.createObjectURL(blobObj);

    const aDownload = document.createElement('a');

    const now = new Date();
    const fileName = `symProfile_${now.getTime()}.json`;

    aDownload.setAttribute('href', urlProfile);
    aDownload.setAttribute('download', fileName);

    aDownload.click();

    URL.revokeObjectURL(urlProfile);

}

function loadSymProfile(){

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".json");

    input.onchange = async () => {

        const file = input.files[0];
        const fileText = await file.text()
        const profileData = JSON.parse(fileText);

        setSymSlidersProfile(profileData);
    }

    input.click();

}

// Initialisation des sliders à partir des BS qui ont une symétrie
function initSymSlider(){
    for(const baseBS in symmetricBlendshapes){
        createSymSlider(baseBS);
    }
}

function initSymSlidersControls(){
    const leftButton = createSymSliderControl("LEFT");
    leftButton.addEventListener("click", () => {
        setSymSlidersToLeft();
    })

    const defaultButton = createSymSliderControl("DEFAULT");
    defaultButton.addEventListener("click", () => {
        setSymSlidersToDefault();
    })

    const rightButton = createSymSliderControl("RIGHT");
    rightButton.addEventListener("click", () => {
        setSymSlidersToRight();
    })

    const saveProfile = createSymSliderControl("SAVE PROFILE");
    saveProfile.addEventListener("click", () => {
        downloadSymProfile();
    })

    const loadProfile = createSymSliderControl("LOAD PROFILE");
    loadProfile.addEventListener("click", () => {
        loadSymProfile();
    })
}

// Fonction utilitaire pour modifier les sliders
function setSymSliderValue(baseBS, value = 0){
    allSymSlidersValues[baseBS] = value;
    allSymSliders[baseBS].value = value.toString();
}

function setSymSlidersValue(value = 0){
    for (const baseBS in allSymSlidersValues){
        setSymSliderValue(baseBS, value);
    }
}

export function setSymSlidersToLeft(){
    setSymSlidersValue(-1);
}

export function setSymSlidersToRight(){
    setSymSlidersValue(1);
}

export function setSymSlidersToDefault(){
    setSymSlidersValue(0);
}


// Fonction pour appliquer un profil aux sliders
function setSymSlidersProfile(symProfile){

    console.log("🚀 Lecture du profil : " + symProfile)

    for(const key in symProfile){
        if(key in allSymSlidersValues){

            if(symProfile[key] > 1 || symProfile[key] < -1){
                console.log(`⚠️ La clé ${key} du profil n'est pas associé à une valeur valide (${symProfile[key]})`)
            }
            else{
                setSymSliderValue(key, symProfile[key]);
            }


        }
        else{
            console.log(`⚠️ La clé ${key} du profil n'est pas reconnu comme un blendshape valide.`)
        }

    }
}

// ----------------------------------------------------------------

// Initialisation à la fin du programme
initSymSlider();
initSymSlidersControls();

// Debug pour la variable globale des sliders
// document.addEventListener('keydown', () => {
//    console.log(allSymSliders)
// })
