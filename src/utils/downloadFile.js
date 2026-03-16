import {allSymSlidersValues} from "../ui/symmetrySlider";

export function downloadJSONFile(dataObject, fileName) {

    const data = JSON.stringify(dataObject, null, 2);

    // On crée l'objet BLOB
    const blobObj = new Blob([data], { type: "application/json" });
    const urlData = URL.createObjectURL(blobObj);

    const aDownload = document.createElement('a');

    aDownload.setAttribute('href', urlData);
    aDownload.setAttribute('download', fileName);

    aDownload.click();

    URL.revokeObjectURL(urlData);
}