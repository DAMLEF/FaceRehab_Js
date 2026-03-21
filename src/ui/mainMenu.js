import {getHTMLTemplate} from "../utils/getHTMLTemplate";
import {closeInterface} from "../utils/interfaceUtils";

const mainMenuHTML = await fetch("src/templates/mainMenu.html").then(r => r.text());

const mainMenuDivId = "mainMenu"

export const LIVE_LINK_CHOICE = "Live Link Bridge";
export const REHABILITATION_CHOICE = "Rehabilitation"
export const SYMMETRY_CONTROLS_CHOICE = "Symmetry Controls"

export let appChoice = undefined;


export function closeMainMenu(){
    closeInterface(mainMenuDivId);
}

function rehabilitationChoice(){
    appChoice = REHABILITATION_CHOICE;
}

function liveLinkChoice(){
    appChoice = LIVE_LINK_CHOICE;
}

function symmetryControlsChoice(){
    appChoice = SYMMETRY_CONTROLS_CHOICE;
}

function initMainMenu() {
    const mainMenu = getHTMLTemplate(mainMenuHTML);

    document.body.appendChild(mainMenu);

    const buttons = mainMenu.querySelectorAll('button');

    // Bouton 0 pour la rééducation
    buttons[0].addEventListener('click', rehabilitationChoice);

    // Bouton 1 pour construire les profils de symétries
    buttons[1].addEventListener('click', symmetryControlsChoice);

    // Bouton 2 pour créer le pont avec LiveLink
    buttons[2].addEventListener('click', liveLinkChoice);
}

initMainMenu();