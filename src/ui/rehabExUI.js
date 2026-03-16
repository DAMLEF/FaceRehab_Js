import {getHTMLTemplate} from "../utils/getHTMLTemplate";

const holdBarTemplateHTML = await fetch("src/templates/rehabExHoldBar.html").then(r => r.text());

const rehabExDivId = "rehabExercise";

const holdBarId = "rehabExHoldBar"
const holdBarProgressId = "rehabHoldBarProgress"

export function updateHoldBar(active, percent){
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

function initHoldBar(){
    const rehabDiv = document.getElementById(rehabExDivId)

    const holdBar = getHTMLTemplate(holdBarTemplateHTML);

    rehabDiv.appendChild(holdBar);
}

function initRehabExUI() {
    initHoldBar()

}

initHoldBar();

