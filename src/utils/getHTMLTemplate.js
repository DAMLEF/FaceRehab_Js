

export function getHTMLTemplate(templateHTML = ""){
    // Récupération du template depuis le raw Text
    const div = document.createElement("div");
    div.innerHTML = templateHTML;

    return div.children[1];
}