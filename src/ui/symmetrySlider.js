import symmetricBlendshapes from '/src/config/symmetricBlendshapes.json' assert { type: 'json' };

const templateHTML = await fetch("src/templates/symmetrySlider.html").then(r => r.text());

const symSlidersDivId = "symSliders";

export let allSymSliders = {}

function createSlider(name) {
    // Récupération du template depuis le raw Text
    const div = document.createElement("div");
    div.innerHTML = templateHTML;

    // Rangement de la div dans la variable slider
    const slider = div.children[1];

    // On change le nom du slider
    const sliderParamP = slider.children[0];
    sliderParamP.innerText = name;

    // On modifie la

    // On ajoute le slider sur la page et on garde en mémoire le résultat du paramètre
    document.getElementById(symSlidersDivId).appendChild(slider);
    allSymSliders[name] = 0;

    // On ajoute un listener qui met à jour le paramètre dans le tableau
    const inputDiv = slider.children[1];
    const sliderInput = inputDiv.children[1];

    sliderInput.addEventListener('input', () => {
        allSymSliders[name] = parseInt(sliderInput.value);
    })
}

export function initSymSlider(){
    for(const baseBS in symmetricBlendshapes){
        createSlider(baseBS);
    }
}

initSymSlider();

// Debug pour la variable globale des sliders
// document.addEventListener('keydown', () => {
//    console.log(allSymSliders)
// })

// Gestion des Sliders