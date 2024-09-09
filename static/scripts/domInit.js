// domInit.js

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

