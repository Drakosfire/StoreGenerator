// main.js

import { initializeDOMElements } from '/static/scripts/domInit.js';
import { getState } from './state.js';
import { setupEventListeners } from '/static/scripts/eventHandlers.js';
import { extractBlocks } from '/static/scripts/blockHandler.js';
import { initialLoadJSON, loadHandler } from '/static/scripts/JSONHandler.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Initialize DOM elements
    const elements = initializeDOMElements();
    if (!elements) {
        console.error('DOM initialization failed.');
        return;
    }

    // Set up initial state
    const state = getState();

    setupEventListeners(elements); // Set up event listeners after DOM initialization
    //     extractBlocks(elements);
    try {
        // Wait for the JSON to load into the state
        await initialLoadJSON();  // Ensure JSON is loaded into the state before proceeding

        // Call loadHandler after JSON is loaded
        loadHandler(elements);
    } catch (error) {
        console.error('Error loading JSON:', error);
    }

});
