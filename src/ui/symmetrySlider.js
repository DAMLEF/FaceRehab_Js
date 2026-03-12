const templateHTML = await fetch("src/templates/symmetrySlider.html").then(r => r.text());

const symSlidersDivId = "symSliders";

let allSymSliders = {}

function createSlider(name) {
    const div = document.createElement("div");
    div.innerHTML = templateHTML;

    console.log(templateHTML)

    const slider = div.children[1];

    document.getElementById(symSlidersDivId).appendChild(slider);
    allSymSliders[name] = slider;
}

createSlider("Bouche ABCD :")
createSlider("Bouche ABCD :")
createSlider("Bouche ABCD :")
createSlider("Bouche ABCD :")
createSlider("Bouche ABCD :")
createSlider("Bouche ABCD :")
createSlider("Bouche ABCD :")
createSlider("Bouche ABCD :")