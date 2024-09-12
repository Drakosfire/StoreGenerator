import {getState} from "/static/scripts/state.js";
import {buildTitleBlock} from "/static/scripts/blockBuilder.js";

// Load JSON data from the server into the state as jsonData
export async function initialLoadJSON() {
    let state = getState();
    
    try {
    const response = await fetch('/static/json/enchantedRootsGearEmporium.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        
        const data = await response.json();
        state.jsonData = data;
        console.log('Data loaded successfully', state.jsonData);
    }
    catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}
export function loadHandler() {
    let state = getState();
    let containerBlocks = state.jsonData.containerBlocks;
    let pageBlocks = state.jsonData.pageBlocks;
    let blockId = 0;
    let containerBlocksList = [];
    let pageBlocksList = [];

    // iterate through container blocks, identify their type, and build the html
    for (const block of containerBlocks) {
        if (block.type === "title") {
            let titleBlockHtml = buildTitleBlock(block, blockId);
            containerBlocksList.push(titleBlockHtml);
        }
        if (block.type === "image") {
            let imageBlockHtml = buildImageBlock(block, blockId);
            containerBlocksList.push(imageBlockHtml);
        }
    }

}   
