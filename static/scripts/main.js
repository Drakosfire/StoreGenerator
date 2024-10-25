// main.js

import { initializeDOMElements, initialLoadJSON } from './domInit.js';
import { getState, updateState } from './state.js';
import { setupEventListeners } from './eventHandlers.js';
import { loadHandler } from './saveLoadHandler.js';
import { fetchLoadingImages } from '/static/scripts/loadingImage.js';
import { loadConfig } from './config.js';


document.addEventListener('DOMContentLoaded', async function () {
    // Initialize DOM elements
    await loadConfig();
    const elements = initializeDOMElements();
    if (!elements) {
        console.error('DOM initialization failed.');
        return;
    }

    // Set up initial state
    const state = getState();
    fetchLoadingImages();
    setupEventListeners(elements); // Set up event listeners after DOM initialization
    //     extractBlocks(elements);
    try {
        // Wait for the JSON to load into the state
        await initialLoadJSON();  // Ensure JSON is loaded into the state before proceeding

        // Call loadHandler after JSON is loaded
        loadHandler();
    } catch (error) {
        console.error('Error loading JSON:', error);
    }


});

