import { getState } from './state.js';
import { addPage } from './pageHandler.js';
import { initializeTextareaResizing } from './handleTextareas.js';
import { loadHandler } from './saveLoadHandler.js';

export function handleReset(elements) {
    console.log('Reset button clicked');
    const state = getState();
    // Clear blockContainer before reinserting blocks
    let blockPage = document.getElementById('block-page');
    console.log('blockPage:', blockPage);
    blockPage.innerHTML = '';
    console.log('Current initial positions:', state.initialPositions);
    loadHandler(elements);

    // Remove all pages except the first one
    let pageContainer = document.getElementById('pages');
    let pages = pageContainer.querySelectorAll('.page');
    console.log('Pages:', pages);
    pages.forEach(page => {
        page.remove();
    }
    );
    let currentPage = pageContainer.querySelector('.page');
    console.log('Current page:', currentPage);
    // If no existing page is found, create the first page
    if (!currentPage) {
        currentPage = addPage(elements);
        currentPage.setAttribute('data-page-id', 'page-0');
        console.log('No existing pages found. Created the first page:', currentPage.id);
    }
    // 


    console.log('Reset complete, all blocks moved back to block-container');
    initializeTextareaResizing();
}

export function printScreen() {
    window.print()
}


