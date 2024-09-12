
import { handleDragStart, handleDragEnd } from "/static/scripts/dragDropHandler.js";

function finishBlockProcessing(block) {
    const newBlock = document.createElement('div');
    newBlock.innerHTML = block;
    newBlock.addEventListener('dragstart', handleDragStart);
    newBlock.addEventListener('dragend', handleDragEnd);
    return newBlock;
}

// Helper function to format the keys for display purposes
function formatKeyToDisplay(key) {
    return key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Take in a specific iterable type and iterable, and return the html for that iterable

export function processIterable(iterableType, iterable, blockId) {
    let iterableHtml = '';

    for (let item of iterable) {
        iterableHtml += `<tr>
                <td align="left"><strong>${formatKeyToDisplay(iterableType)}</strong></td>
                <td align="right"><textarea class="string-action-description-textarea" id="user-store-${iterableType}-${blockId}"
                hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${iterableType}-${blockId}t" hx-swap="outerHTML"
                title="${formatKeyToDisplay(iterableType)}">${item.name}</textarea></td>
            </tr>`;
    }
    return iterableHtml;
}

export function buildTitleBlock(block, blockId) {
    let titleBlockHtml = `<div class="block-item" type="title" data-block-id = ${blockId} data-page-id=${block.dataPageId} draggable="true"><h1>
    <textarea class="title-textarea" id="user-store-title" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-name" hx-swap="outerHTML" title="Name of store">${block.title}</textarea></h1>
    <div contenteditable="true" class="description-textarea" id="user-store-description"
        hx-post="/update-stats" hx-trigger="change"
        hx-target="#user-monster-description" hx-swap="outerHTML"
        title="Any amount or style of description">
       <p>${block.title} ${block.description} </p>
    </div> `;
    const newBlock = finishBlockProcessing(titleBlockHtml);
    return newBlock;
}

export function buildImageBlock(block, blockId) {
    let imageBlockHtml = `<div class="block-item" type ="image" data-block-id = ${blockId}>
    <img src="${block.imgUrl}" alt="Store Image" class="store-image" hx-get="/update-stats" hx-trigger="load" hx-target="#user-store-image" hx-swap="outerHTML" title="Store Image">
    <textarea class="image-textarea" id="user-store-image" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-image" hx-swap="outerHTML" title="Store Image">${block.sdprompt}</textarea>
    </div>`;
    const newBlock = finishBlockProcessing(imageBlockHtml);
    return newBlock;
}

export function buildStorePropertiesBlock(block, blockId) {
    let storePropertiesBlockHtmlStart = `
    <div class="block-item" data-block-id="${blockId}">
    <div class="block classTable frame decoration">
        <table>
            <thead>
                <tr>
                    <th align="left"></th>
                    <th align="center"></th>
                    <th align="center"></th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let key in block) {
        if (Array.isArray(block[key])) {
            storePropertiesBlockHtmlStart += processIterable(key, block[key], blockId);
        } else if (key !== 'type') {
            storePropertiesBlockHtmlStart += `
                <tr>
                    <td align="left"><strong>${key}</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-${key}-${blockId}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${key}-${blockId}t" hx-swap="outerHTML"
                  title="${key}">${block[key]}</textarea></td>
                </tr>`;
        }
    }

    let storePropertiesBlockHtmlEnd = `
            </tbody>
        </table>
    </div>
    </div>`;
    const storePropertiesBlockHtml = storePropertiesBlockHtmlStart + storePropertiesBlockHtmlEnd;
    const newBlock = finishBlockProcessing(storePropertiesBlockHtml);
    return newBlock;

}