import {randomChoice} from "./utils/randomChoice";

// Chargement des profils de visages
import smileBSProfile from "./data/faces/bsProfile_smile.json"
import angryBSProfile from "./data/faces/bsProfile_angry.json"
import sadnessBSProfile from "./data/faces/bsProfile_sadness.json"
import surpriseBSProfile from "./data/faces/bsProfile_surprise.json"
import disgustBSProfile from "./data/faces/bsProfile_disgust.json"

import {playRehabExStepSuccessSound, updateRehabExUI} from "./ui/rehabExUI";

// Liste des visages utilisés pour les exercices
const faceProfiles = [smileBSProfile, angryBSProfile, surpriseBSProfile, disgustBSProfile, sadnessBSProfile];

// Temps statique
const HOLD_DURATION = 3000     // Temps en ms

// Coefficient de Similarité attendu
const SIMILARITY_THRESHOLD = 0.65;

// Étapes par exercice
const STEPS_PER_EXERCISE = 5;

// Temps avant de pouvoir skip l'exercice
const TIME_BEFORE_AUTHORIZE_SKIP = HOLD_DURATION * 2;


class RehabExercise{
    constructor(){
        this.currentStep = 0;
        this.currentStepStartTime = Date.now();


        this.currentProfile = randomChoice(faceProfiles);


        this.holdStart = null;

    }

    update(score){
        const currentTime = Date.now();

        let holdBarProgress = 0;
        if(score > SIMILARITY_THRESHOLD){
            if(this.holdStart == null){
               this.startHold();
            }



            if(currentTime - this.holdStart > HOLD_DURATION){
                this.successStep();
            }

            holdBarProgress = (currentTime - this.holdStart)/HOLD_DURATION;
        }
        else{
            this.cancelHold();
        }

        const holdBarActive = (this.holdStart !== null);
        const skipActive = (currentTime - this.currentStepStartTime >= TIME_BEFORE_AUTHORIZE_SKIP);



        const skipStatus = updateRehabExUI(this.currentStep + 1, STEPS_PER_EXERCISE, holdBarActive, holdBarProgress, skipActive);

        if(skipStatus){
            this.newStep();
        }
    }

    successStep(){
        playRehabExStepSuccessSound();

        this.newStep();
    }

    newStep(){


        this.currentStep += 1;
        this.currentProfile = randomChoice(faceProfiles);

        this.currentStepStartTime = Date.now();

        if(this.currentStep === STEPS_PER_EXERCISE){
            this.endExercise();
        }

    }

    endExercise(){
        this.currentStep = -1

    }

    startHold(){
        this.holdStart = Date.now();
    }

    cancelHold(){
        if(this.holdStart !== null){
            this.holdStart = null;
        }

    }
}

export function rehabExercise(appState){

    if(appState.rehabEx === undefined){
        appState.rehabEx = new RehabExercise();
    }

    appState.rehabEx.update(appState.similarityScore);

}