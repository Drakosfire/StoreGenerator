 // Handle the drop event on the trash area
 import { reinsertBlock, sortBlocksById } from './blockHandler.js';
 import { initializeTextareaResizing } from './handleTextareas.js';

 export function handleTrashDrop(e, elements) {
    e.preventDefault();
    const innerHTML = e.dataTransfer.getData('text/plain');
    const blockId = e.dataTransfer.getData('block-id');
    console.log('Trash Drop event:', e);
    console.log('Dragged block ID to trash:', blockId);

    if (innerHTML && blockId) {
        // Find the dragged element and remove it from the DOM
        let draggedElement = document.querySelector(`[data-block-id="${blockId}"].block-page`);
        if (!draggedElement) {
            draggedElement = document.querySelector(`[data-block-id="${blockId}"].block-item`);
        }
        if (draggedElement && draggedElement.parentElement) {
            draggedElement.parentElement.removeChild(draggedElement);
            console.log(`Removed block with ID: ${blockId} from the page`);
        }

        // Check if the block already exists in the block-container and remove it if it does
        let existingBlock = blockContainer.querySelector(`[data-block-id="${blockId}"].block-page`);
        if (!existingBlock) {
            existingBlock = blockContainer.querySelector(`[data-block-id="${blockId}"].block-item`);
        }
        if (existingBlock && existingBlock.parentElement) {
            existingBlock.parentElement.removeChild(existingBlock);
            console.log(`Removed duplicate block with ID: ${blockId} from block-container`);
        }

        // Ensure the block is appended to the page wrapper inside blockContainer
        let blockContainerPage = elements.blockContainer.querySelector('.page');
        if (!blockContainerPage) {
            blockContainerPage = document.createElement('div');
            blockContainerPage.classList.add('page');
            blockContainerPage.setAttribute('data-page-id', 'block-container');
            elements.blockContainer.appendChild(blockContainerPage);
        }

        // Reinsert the block using the refactored function
    reinsertBlock(blockContainerPage, blockId, innerHTML);
    sortBlocksById(blockContainerPage);
        } else {
            console.log('No data transferred');
        }
    // Remove the "over" class and reset the background image
    trashArea.classList.remove('over');
    trashArea.style.backgroundImage = "url('./static/images/closed-mimic-trashcan.png')";
    
    initializeTextareaResizing();
}

export function handleTrashOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    trashArea.classList.add('over');
    trashArea.style.backgroundImage = "url('./static/images/mimic_trashcan.png')";
    console.log('Trash over event');
}

export function handleTrashLeave(e) {
    trashArea.classList.remove('over');
    trashArea.style.backgroundImage = "url('./static/images/closed-mimic-trashcan.png')";
    console.log('Trash leave event');
}