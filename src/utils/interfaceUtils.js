export function closeInterface(interfaceName) {

    const interfaceDiv = document.getElementById(interfaceName);

    interfaceDiv.style.display = 'none';
}

export function openInterface(interfaceName) {
    const interfaceDiv = document.getElementById(interfaceName);

    interfaceDiv.style.display = 'block';
}