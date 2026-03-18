
export function createAudioTag(soundPath, soundId){

    const audioTag = document.createElement("audio");
    audioTag.setAttribute("src", soundPath);
    audioTag.setAttribute("id", soundId);

    audioTag.currentTime = 0;


    return audioTag
}

export function playSound(soundId){
    const audioTag = document.getElementById(soundId);

    audioTag.currentTime = 0;

    audioTag.play();
}