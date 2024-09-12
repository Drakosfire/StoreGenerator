import { getState,updateState } from "/static/scripts/state.js";
import { buildTitleBlock,
         buildImageBlock,
         buildStorePropertiesBlock,
         buildOwnerBlock,
        buildEmployeeBlock } from "/static/scripts/blockBuilder.js";
import { storeInitialPositions } from "/static/scripts/blockHandler.js";
import { initializeTextareaResizing } from "/static/scripts/handleTextareas.js";

// holding function here until/if needed
function appendBlockToDOM(newBlock) {
    let blockContainerPage = document.getElementById('block-page');
    blockContainerPage.appendChild(newBlock);
}

// Load JSON data from the server into the state as jsonData
export async function initialLoadJSON() {
    let state = getState();
    
    try {
    const response = await fetch('/static/json/enchantedRootsGearEmporium.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        
        const data = await response.json();
        updateState('jsonData',data);

        // console.log('State after updating jsonData:', getState().jsonData); 
       }
    catch (error) {
        console.error('Template store not loaded into state:', error);
    }
}


export function loadHandler(elements) {
    const { blockContainerPage } = elements; 
    const { pageContainer } = elements;
    
    let state = getState();
    // console.log('jsonData:', state.jsonData);
    let containerBlocks = state.jsonData.containerBlocks;
    console.log('Container blocks:', containerBlocks);
    let pageBlocks = state.jsonData.pageBlocks;
    let blockId = 0;
    // check how many owner blocks there are in total
    let ownerCount = 0;
    let employeeCount = 0;
    for (const [blockId, block] of Object.entries(containerBlocks)) {
        if (block.type === 'owner') {
            ownerCount++;
        }
        if (block.type === 'employee') {
            employeeCount++;
        }
    }
    for (const [blockId, block] of Object.entries(pageBlocks)) {
        if (block.type === 'owner') {
            ownerCount++;
        }
        if (block.type === 'employee') {
            employeeCount++;
        }
    }

    let containerBlocksList = iterateThroughBlocks(containerBlocks, ownerCount, employeeCount);    
    let pageBlocksList = iterateThroughBlocks(pageBlocks, ownerCount, employeeCount);
    storeInitialPositions(elements.blockContainer);
    initializeTextareaResizing();

     
}
    // iterate through container blocks, identify their type, and build the html

function iterateThroughBlocks(blocks, ownerCount, employeeCount) {
    let ownerID = 0;
    let employeeID = 0;
    for (const [blockId, block] of Object.entries(blocks)) {
        console.log(`Processing Block ID: ${blockId}, Type: ${block.type}`);

        // Depending on the block type, handle it accordingly
        switch (block.type) {
            case 'title':
                console.log('Processing title block', block);
                const titleBlockHtml = buildTitleBlock(block, blockId);
                appendBlockToDOM(titleBlockHtml);
                break;
                
            case 'image':
                // Call your function to build image block
                const imageBlockHtml = buildImageBlock(block, blockId);
                appendBlockToDOM(imageBlockHtml);
                break;
                
            case 'store-properties':
                // Call your function to build store properties block
                const storePropertiesBlockHtml = buildStorePropertiesBlock(block, blockId);
                appendBlockToDOM(storePropertiesBlockHtml);
                break;
                
            case 'owner':
                // Call your function to handle owner block
                ownerID++;
                const ownerBlockHtml = buildOwnerBlock(block, blockId, ownerCount, ownerID);
                appendBlockToDOM(ownerBlockHtml);
                break;

            case 'employee':
                // Call your function to handle employee block
                employeeID++;
                const employeeBlockHtml = buildEmployeeBlock(block, blockId, employeeCount, employeeID);
                appendBlockToDOM(employeeBlockHtml);
                break;

            // case 'inventory':
            //     // Handle inventory block, if necessary
            //     const inventoryBlockHtml = buildInventoryBlock(block, blockId);
            //     appendBlockToDOM(inventoryBlockHtml);
            //     break;

            // Add cases for other block types as needed...

            default:
                console.log(`Unknown block type: ${block.type}`);
                break;
        }
    }
}
