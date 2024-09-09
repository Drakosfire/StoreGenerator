import { getState } from './state.js';
import { reinsertBlock, sortBlocksById } from './blockHandler.js';
import { addPage } from './pageHandler.js';
import { initializeTextareaResizing } from './handleTextareas.js';

export function handleReset(elements) {
    console.log('Reset button clicked');
    const state = getState(); 
    
    // Collect all blocks from all pages
    const allBlocks = [];
    const pages = document.querySelectorAll('.page');
    
    pages.forEach(page => {
        console.log(`Processing page with ID: ${page.getAttribute('data-page-id')}`);
        
        const blocksOnPage = page.querySelectorAll('[data-block-id]');
        
        blocksOnPage.forEach(block => {
            block.setAttribute('display', 'block');
            const blockId = block.getAttribute('data-block-id');
            allBlocks.push({
                id: blockId,
                innerHTML: block.innerHTML
            });
            block.remove();
            console.log(`Removed block with ID: ${blockId} from page ID: ${page.getAttribute('data-page-id')}`);
        });
    });

    // Log blocks collected
    console.log('All blocks collected:', allBlocks);

    // Clear all pages
    pages.forEach(page => {
        console.log(`Removing page with ID: ${page.getAttribute('data-page-id')}`);
        page.remove();
    });

    // Clear blockContainer before reinserting blocks
    console.log('Clearing blockContainer...');
    elements.blockContainer.innerHTML = '';

   // Create a new page inside the blockContainer
    const blockContainerPage = document.createElement('div');
    blockContainerPage.classList.add('page');
    blockContainerPage.setAttribute('id', 'block-page');
    elements.blockContainer.appendChild(blockContainerPage);
    console.log('Created new blockContainerPage');

    // Reassign blockContainerPage to the newly created block-page element
    console.log('blockContainerPage reassigned to:', blockContainerPage);

    // Reinsert blocks back into the blockContainer in their original order
    state.initialPositions.forEach(pos => {
        const blockData = allBlocks.find(block => block.id === pos.id);
        
        if (blockData) {
            console.log(`Reinserting block with ID: ${blockData.id} into blockContainerPage`);
            reinsertBlock(blockContainerPage, blockData.id, blockData.innerHTML);
            sortBlocksById(blockContainerPage);
        } else {
            console.log(`Block with ID: ${pos.id} not found in collected blocks.`);
        }
    });

// Add a new page after reset
let currentPage = pageContainer.querySelector('.page'); 
console.log('Current page:', currentPage);
    // If no existing page is found, create the first page
    if (!currentPage) {
        currentPage = addPage(elements);
        currentPage.setAttribute('data-page-id', 'page-0');
        console.log('No existing pages found. Created the first page:', currentPage.id);
    }
        

console.log('Reset complete, all blocks moved back to block-container');
initializeTextareaResizing();
}

export function printScreen() {
    window.print()
}