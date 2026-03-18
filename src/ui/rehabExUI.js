import {getHTMLTemplate} from "../utils/getHTMLTemplate";
import {createAudioTag, playSound} from "../utils/soundManager";

const holdBarTemplateHTML = await fetch("src/templates/rehabExHoldBar.html").then(r => r.text());
const stepIndicatorTemplateHTML = await fetch("src/templates/rehabExStepIndicator.html").then(r => r.text());

const skipButtonHTML = await fetch("src/templates/rehabExSkipButton.html").then(r => r.text());

const scoreSectionHTML = await fetch("src/templates/rehabExScoreIndicator.html").then(r => r.text());


const rehabExDivId = "rehabExercise";

const rehabDiv = document.getElementById(rehabExDivId)

/* Hold Bar */
const holdBarId = "rehabExHoldBar"
const holdBarProgressId = "rehabHoldBarProgress"
/* --- */

/* Step Indicator */
const stepIndicatorId = "rehabExerciseStepIndicator"
/* --- */

/* Skip Button */
const skipButtonId = "rehabExerciseSkipButton";
let skipButtonStatus = false;

/* Score Indicator */
const scoreDivId = "rehabExerciseScoreIndicator";
const scoreTextId = "rehabExerciseScoreIndicator-ScoreText";
const scorePercentageTextId = "rehabExerciseScoreIndicator-PercentageText"
/* --- */

/* Sound Path */
const stepSuccessSoundId = "rehabExerciseStepSuccessSoundId";
const stepSuccessSoundPath = "assets/sounds/step_success.wav";
/**/

export function updateRehabExUI(currentStep, maxStep, holdBarActive, holdBarPercent, skipButtonActive, similarityScore){
    updateHoldBar(holdBarActive, holdBarPercent);
    updateStepIndicator(currentStep, maxStep);
    updateSkipButton(skipButtonActive);

    updateScoreIndicator(similarityScore);

    return skipButtonStatus;
}

function updateHoldBar(active, percent){
    const holdBar = document.getElementById(holdBarId);

    if(active){
        holdBar.style.display = "block";
    }
    else{
        holdBar.style.display = "none";
        return;
    }

    const progressBar = document.getElementById(holdBarProgressId);


    percent = Math.max(0, Math.min(1, percent)); // clamp 0-1

    progressBar.style.width = `${percent * 100}%`;
}

function updateStepIndicator(currentStep, maxStep){
    const stepIndicator = document.getElementById(stepIndicatorId);

    if(currentStep >= 0 && maxStep > 0){
        stepIndicator.style.display = "block";

        stepIndicator.innerText = `${currentStep}/${maxStep}`;
    }
    else{
        stepIndicator.style.display = "none";
    }
}

function updateSkipButton(active){
    const skipButton = document.getElementById(skipButtonId);

    if(active){
        skipButton.style.display = "block";
    }
    else{
        skipButton.style.display = "none";
        skipButtonStatus = false;
    }
}

// Fonction pour convertir un score en couleur
function scoreToColor(score) {
    if (score === undefined || isNaN(score) || score <= 15) return 'red';
    if (score >= 70) return 'green';

    // Interpolation simple rouge → orange → jaune → vert
    // Score 15-70%
    let percent = (score - 15) / (70 - 15); // normalize entre 0 et 1

    // On va faire un dégradé rouge → orange → yellow → green
    // Pour simplifier, on fait un rouge -> yellow -> green approximatif en RGB
    let r, g, b = 0;

    if (percent < 0.5) {
        // rouge → jaune
        r = 255;
        g = Math.round(255 * (percent / 0.5)); // 0 → 255
    } else {
        // jaune → vert
        r = Math.round(255 * (1 - ((percent - 0.5) / 0.5))); // 255 → 0
        g = 255;
    }

    return `rgb(${r},${g},0)`;
}


function updateScoreIndicator(similarityScore){
    const scoreDiv = document.getElementById(scoreDivId);


    const percentageText = document.getElementById(scorePercentageTextId);

    scoreDiv.style.display = "block";

    if(isNaN(similarityScore)){
        similarityScore = 0;
    }

    percentageText.innerText = `${similarityScore} %`;

    const color = scoreToColor(similarityScore);
    scoreDiv.style.setProperty("--glow-color", color);
}

/* Action du bouton de skip d'une étape*/
function skipButtonAction(){
    skipButtonStatus = true;
}

function initHoldBar(){
    const holdBar = getHTMLTemplate(holdBarTemplateHTML);

    rehabDiv.appendChild(holdBar);
    holdBar.style.display = "none";
}

function initSkipButton(){

    const skipButton = getHTMLTemplate(skipButtonHTML);

    rehabDiv.appendChild(skipButton)
    skipButton.style.display = "none";

    skipButton.addEventListener("click", () => {
        skipButtonAction();
    })
}

function initStepIndicator(){
    const stepIndicator = getHTMLTemplate(stepIndicatorTemplateHTML);

    rehabDiv.appendChild(stepIndicator);
    stepIndicator.style.display = "none";


}

function initScoreIndicator(){
    const scoreIndicator = getHTMLTemplate(scoreSectionHTML);

    rehabDiv.appendChild(scoreIndicator);

    scoreIndicator.style.display = "none";
}

function initSoundEffects(){

    const audioStepSuccess = createAudioTag(stepSuccessSoundPath, stepSuccessSoundId)
    rehabDiv.appendChild(audioStepSuccess);
}

export function playRehabExStepSuccessSound(){
    playSound(stepSuccessSoundId);
}

function initRehabExUI() {
    initScoreIndicator();
    initStepIndicator();
    initHoldBar();

    initSkipButton();

    initSoundEffects();

}

initRehabExUI();

