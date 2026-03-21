

const connectedColor = "#5cb85c"
const disconnectedColor = "#d63834";

const connectedText = "● Connected"
const disconnectedText = "● Disconnected"

const wsStatusDivIdFaceTracker = "wsFaceTracker";
const wsStatusDivIdLiveLinkBridge = "wsLiveLinkBridge";


function updateSocketStatus(socketId, state){
    const socketStatusDiv = document.getElementById(socketId);

    const socketStatusText = socketStatusDiv.getElementsByTagName("div")[0];

    socketStatusDiv.style.display = "block";

    if(state){
        socketStatusText.style.color = connectedColor;
        socketStatusText.innerText = connectedText;
    }
    else{
        socketStatusText.style.color = disconnectedColor;
        socketStatusText.innerText = disconnectedText;
    }

}

function updateFaceTrackerSocketStatus(state) {
    updateSocketStatus(wsStatusDivIdFaceTracker, state);
}

function updateLiveLinkBridgeSocketStatus(state) {
    updateSocketStatus(wsStatusDivIdLiveLinkBridge, state);
}

export function updateAllSocketsStatus(appState){
    updateFaceTrackerSocketStatus(appState.faceTrackerStatus);
    updateLiveLinkBridgeSocketStatus(appState.liveLinkBridgeStatus);
}
