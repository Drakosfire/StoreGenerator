// eventHandlers.js
import { printScreen, handleReset } from './utils.js';
import { addPage, removePage } from './pageHandler.js';
import {
    toggleAllTextBlocks,
    autofillBlocks,
    storeInitialPositions
} from './blockHandler.js';
import { startLoadingAnimation, stopLoadingAnimation } from './loadingImage.js';
import { handleDragOver, handleDrop, } from './dragDropHandler.js';
import { handleTrashOver, handleTrashDrop, handleTrashLeave } from './trashHandler.js';
import { getState, updateState } from './state.js';
import { loadHandler, convertToBlockFormat, saveHandler } from './JSONHandler.js';

// Function to handle click events
export function handleClick(event, elements) {
    console.log('Click detected:', event.target);

    // Handle image clicks for modal display
    if (event.target.tagName === 'IMG' && event.target.id.startsWith('generated-image-')) {
        console.log('Image clicked for modal display. Image ID:', event.target.id);
        elements.modal.style.display = 'block';
        elements.modalImg.src = event.target.src;
        captionText.innerHTML = event.target.alt;
    }

    // Handle modal close button
    if (event.target.id === 'closeModal') {
        console.log('Close button clicked for modal. Element ID:', event.target.id);
        elements.modal.style.display = "none";
    }

    // Handle modal close when clicking outside of the modal content
    if (event.target === elements.modal) {
        console.log('Clicked outside of modal content, closing modal.');
        elements.modal.style.display = "none";
    }
    // Handle print button click
    if (event.target.id === 'printButton') {
        console.log('Print button clicked. Element ID:', event.target.id);
        printScreen();
    }
    // Handle generate image button click

    const button = event.target.closest('.generate-image-button');

    if (button) {
        const blockId = button.getAttribute('data-block-id');
        console.log('Generate image button clicked. Block ID:', blockId);
        generateImage(blockId);
    }

    // Handle page add button
    if (event.target.id === 'addPageButton') {
        console.log('Add page button clicked. Element ID:', event.target.id);
        addPage(elements);
    }

    // Handle page remove button
    if (event.target.id === 'removePageButton') {
        console.log('Remove page button clicked. Element ID:', event.target.id);
        removePage(elements);
    }

    // Handle toggle button click
    if (event.target.id === 'toggleButton') {
        console.log('Toggle button clicked. Element ID:', event.target.id);
        toggleAllTextBlocks();
    }

    // Handle autofill button click
    if (event.target.id === 'autofillButton') {
        console.log('Autofill button clicked. Element ID:', event.target.id);
        autofillBlocks(elements);
    }

    // Handle reset button click
    if (event.target.id === 'resetButton') {
        console.log('Reset button clicked. Element ID:', event.target.id);
        handleReset(elements);
    }

    // Handle reset button click
    if (event.target.id === 'saveButton') {
        saveHandler();
        console.log('Save button clicked. Element ID:', event.target.id);
    }

    if (event.target.id === 'submitButton') {

        console.log('Submit description button clicked. Element ID:', event.target.id);
        const userInput = document.getElementById('user-description').value;
        elements.blockContainerPage.innerHTML = ''; // Clear the block container before inserting new blocks
        startLoadingAnimation();

        fetch('/process-description', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_input: userInput })
        })
            .then(response => response.json())
            .then(data => {
                // console.log('Success:', data);
                // Store the llm_output in the state for future use

                updateState('jsonData', convertToBlockFormat(data.llm_output));
                let state = getState();
                console.log('LLM output:', state.jsonData);
                state.initialPositions.length = 0; // Clear the initialPositions array
                loadHandler(elements);
                storeInitialPositions(elements.blockContainer);
            })
            .catch((error) => {
                console.error('Error:', error);
            })
            .finally(() => {
                stopLoadingAnimation();
            });
    }
}

// Function to generate image
export function generateImage(blockId) {
    let state = getState();
    let block = state.jsonData[blockId];
    console.log(`Generating image for sd-prompt-${blockId}`);
    const sdPromptElement = document.getElementById(`sd-prompt-${blockId}`);
    const imageElement = document.getElementById(`generated-image-${blockId}`);

    if (!sdPromptElement) {
        console.error('Element with ID sd-prompt not found');
        return;
    }

    if (!imageElement) {
        console.error('Element with ID generated-image not found');
        return;
    }

    const sdPrompt = sdPromptElement.value;
    console.log('sdPrompt:', sdPrompt);

    fetch('/generate-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sd_prompt: sdPrompt })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);
            block['imgUrl'] = data.image_url;
            imageElement.src = data.image_url;
            imageElement.style.display = 'block';

            // Log the image element's HTML structure
            console.log('Updated imageElement HTML:', imageElement.outerHTML);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

export function setupEventListeners(elements) {
    // Click event listener
    document.addEventListener('click', (event) => handleClick(event, elements));

    // Event listeners for drag and drop functionality
    elements.blockContainer.addEventListener('dragover', handleDragOver);

    // Use an anonymous function to pass elements to handleDrop
    elements.blockContainer.addEventListener('drop', (event) => handleDrop(event, elements));
    elements.pageContainer.addEventListener('dragover', handleDragOver);
    elements.pageContainer.addEventListener('drop', (event) => handleDrop(event, elements));

    // Event listeners for trash area
    elements.trashArea.addEventListener('dragover', handleTrashOver);
    elements.trashArea.addEventListener('dragleave', handleTrashLeave);
    elements.trashArea.addEventListener('drop', (event) => handleTrashDrop(event, elements));
}

