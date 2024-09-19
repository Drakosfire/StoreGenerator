// domInit.js
import { updateState, getState } from './state.js';
// Function to initialize and retrieve necessary DOM elements
export function initializeDOMElements() {
    const elements = {};

    // Retrieve and assign DOM elements
    elements.blockContainer = document.getElementById('blockContainer');
    elements.blockContainerPage = document.getElementById('block-page');
    elements.pageContainer = document.getElementById('pages');
    elements.trashArea = document.getElementById('trashArea');
    elements.currentPage = elements.pageContainer ? elements.pageContainer.querySelector('.block.monster.frame.wide') : null;
    elements.modal = document.getElementById('imageModal');
    elements.modalImg = document.getElementById('modalImage');
    elements.captionText = document.getElementById('caption');
    elements.closeModal = document.getElementsByClassName('close')[0];
    elements.loadingImage = document.getElementById('loadingImage');

    // Note: Dynamic elements (e.g., sdPromptElement, imageElement) might need specific handling depending on when they are created.

    // Check for null elements and log errors
    for (const [key, value] of Object.entries(elements)) {
        if (!value) {
            console.error(`${key} element not found`);
        }
    }
    console.log('DOM elements initialized:', elements)

    return elements;
}

// Load JSON data from the server into the state as jsonData
export async function initialLoadJSON() {
    console.log('Loading JSON data from the server');
    try {
        const response = await fetch('/static/Enchanted_Roots_Gear_Emporium/Enchanted_Roots_Gear_Emporium.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        updateState('jsonData', data);
        console.log('State after updating jsonData:', getState().jsonData);
    }
    catch (error) {
        console.error('Template store not loaded into state:', error);
    }
}

