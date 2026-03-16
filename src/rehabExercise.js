import {randomChoice} from "./utils/randomChoice";

// Chargement des profils de visages
import smileBSProfile from "./data/faces/bsProfile_smile.json"
import angryBSProfile from "./data/faces/bsProfile_angry.json"
import sadnessBSProfile from "./data/faces/bsProfile_sadness.json"
import surpriseBSProfile from "./data/faces/bsProfile_surprise.json"
import disgustBSProfile from "./data/faces/bsProfile_disgust.json"

// Liste des visages utilisés pour les exercices
const faceProfiles = [smileBSProfile, angryBSProfile, surpriseBSProfile, disgustBSProfile, sadnessBSProfile];

// Temps statique
const HOLD_DURATION = 3000     // Temps en ms

// Coefficient de Similarité attendu
const SIMILARITY_THRESHOLD = 0.65;

// Étapes par exercice
const STEPS_PER_EXERCISE = 5;

class RehabExercise{
    constructor(){
        this.currentStep = 0;

        this.currentProfile = randomChoice(faceProfiles);

        this.holdStart = null;

    }

    update(score){
        console.log("SCORE :" + score);


        if(score > SIMILARITY_THRESHOLD){
            if(this.holdStart == null){
               this.startHold();
            }

            const currentTime = Date.now();
            if(currentTime - this.holdStart > HOLD_DURATION){
                console.log("HOLD TIME " + currentTime - this.holdStart)
                this.newStep();
            }
        }
        else{
            this.cancelHold();
        }

    }

    newStep(){
        this.currentStep += 1;
        this.currentProfile = randomChoice(faceProfiles);

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