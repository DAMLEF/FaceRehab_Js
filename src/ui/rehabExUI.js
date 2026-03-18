import {getHTMLTemplate} from "../utils/getHTMLTemplate";
import {createAudioTag, playSound} from "../utils/soundManager";

const holdBarTemplateHTML = await fetch("src/templates/rehabExHoldBar.html").then(r => r.text());
const stepIndicatorTemplateHTML = await fetch("src/templates/rehabExStepIndicator.html").then(r => r.text());

const skipButtonHTML = await fetch("src/templates/rehabExSkipButton.html").then(r => r.text());

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

/* Sound Path */
const stepSuccessSoundId = "rehabExerciseStepSuccessSoundId";
const stepSuccessSoundPath = "assets/sounds/step_success.wav";
/**/

export function updateRehabExUI(currentStep, maxStep, holdBarActive, holdBarPercent, skipButtonActive){
    updateHoldBar(holdBarActive, holdBarPercent);
    updateStepIndicator(currentStep, maxStep);
    updateSkipButton(skipButtonActive);

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

function initSoundEffects(){

    const audioStepSuccess = createAudioTag(stepSuccessSoundPath, stepSuccessSoundId)
    rehabDiv.appendChild(audioStepSuccess);
}

export function playRehabExStepSuccessSound(){
    playSound(stepSuccessSoundId);
}

function initRehabExUI() {
    initStepIndicator()
    initHoldBar()

    initSkipButton();

    initSoundEffects();

}

initRehabExUI();

