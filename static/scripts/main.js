// main.js

import { initializeDOMElements } from '/static/scripts/domInit.js';
import { getState, updateState } from './state.js';

import { setupEventListeners } from '/static/scripts/eventHandlers.js';
import {changeImage, startLoadingAnimation, stopLoadingAnimation } from '/static/scripts/loadingImage.js';
import {toggleAllTextBlocks,
        autofillBlocks,
        storeInitialPositions,
        sortBlocksById,
        reinsertBlock,
        insertHtmlBlocks,
        extractBlocks
        } from '/static/scripts/blockHandler.js';
import {handleDragStart, handleDragEnd, handleDragOver, handleDrop} from '/static/scripts/dragDropHandler.js';
import {getColumnFromOffset,
        getColumnHeights,
        adjustPageLayout,
        addPage,
        removePage,
        handleColumnOverflow,
        getNextPage
        } from '/static/scripts/pageHandler.js';
import {handleTrashDrop, handleTrashOver, handleTrashLeave} from '/static/scripts/trashHandler.js';
import {adjustTextareaHeight,
        initializeTextareaResizing,
        lockTextareas,
        unlockTextareas
        } from '/static/scripts/handleTextareas.js';
import { handleClick,generateImage } from '/static/scripts/eventHandlers.js';
import { handleReset, printScreen } from '/static/scripts/utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    const elements = initializeDOMElements();
    if (!elements) {
        console.error('DOM initialization failed.');
        return;
    }

    // Set up initial state
    const state = getState();

    setupEventListeners(elements); // Set up event listeners after DOM initialization
    extractBlocks(elements);
});
