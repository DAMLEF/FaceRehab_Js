import {getHTMLTemplate} from "../utils/getHTMLTemplate";
import {openInterface} from "../utils/interfaceUtils";

const liveLinkBridgeGuideHTML = await fetch("src/templates/liveLinkBridgeGuide.html").then(r => r.text());


export const liveLinkBridgeDivIdGuide = "LiveLinkBridgeGuide";

function initLiveLinkBridgeUI() {
    const guide = getHTMLTemplate(liveLinkBridgeGuideHTML);

    document.body.appendChild(guide);

}

initLiveLinkBridgeUI()

export function openLiveLinkBridgeUI() {
    openInterface(liveLinkBridgeDivIdGuide);
}