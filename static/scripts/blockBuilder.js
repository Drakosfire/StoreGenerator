
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
    return key.replace('store','').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Take in a specific iterable type and iterable, and return the html for that iterable

export function processIterable(iterableType, iterable, blockId) {
    // console.log('Processing iterable:', iterable);
    
    let iterableHtml = `<tr>
        <td align="left"><strong>${formatKeyToDisplay(iterableType)}</strong></td>
        <td align="right"><textarea class="string-action-description-textarea" id="user-store-${iterableType}-${blockId}"
        hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${iterableType}-${blockId}t" hx-swap="outerHTML"
        title="${formatKeyToDisplay(iterableType)}">${iterable.join(', ')}</textarea></td>
    </tr>`;
    
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
    <img src="${block.imgUrl}" alt="" class="store-image" hx-get="/update-stats" hx-trigger="load" hx-target="#user-store-image" hx-swap="outerHTML" >
    <textarea class="image-textarea" id="user-store-image" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-image" hx-swap="outerHTML" title="Store Image">${block.sdprompt}</textarea>
    <button class="generate-image-button" data-block-id="{block_id}" >
            <img src="/static/images/StoreGeneratorGenerateButton.png" alt="Generate Image">
        </button>
        <img id="generated-image-${blockId}" alt="" style="display: none; cursor: pointer;">
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
        } else if (key !== 'type' && key !== 'dataPageId') {
            storePropertiesBlockHtmlStart += `
                <tr>
                    <td align="left"><strong>${formatKeyToDisplay(key)}</strong></td>
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

function buildOwnerHeadingBlock(ownerCount) {
    if (ownerCount === 0) {
        return '';
    } else if (ownerCount === 1) {
        let ownerHeading = `<h2>Owner</h2>`;
    return ownerHeading;
    } else {
        let ownerHeading = `<h2>Owners</h2>`;
        return ownerHeading;
    }
}

function buildEmployeeHeadingBlock(employeeCount) {
    if (employeeCount === 0) {
        return '';
    } else if (employeeCount === 1) {
        let employeeHeading = `<h2>Employee</h2>`;
    return employeeHeading;
    } else {
        let employeeHeading = `<h2>Employees</h2>`;
        return employeeHeading;
    }
}
export function buildOwnerBlock(block, blockId, ownerCount, ownerId) {
    
    let ownerBlockHtml = `<div class="block-item" data-block-id="${blockId} data-page-id=${block.dataPageId}">`;
    if (ownerId === 1) {ownerBlockHtml += buildOwnerHeadingBlock(ownerCount);}
    ownerBlockHtml += `<h3 id="owner_{owner_id}"><textarea class="subtitle-textarea" id="user-store-owner-${ownerId}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-owner-${ownerId}" hx-swap="outerHTML"
                  title="Owner Name">${block.name}</textarea></h3>`
    ownerBlockHtml += `<table>
                            <thead> 
                                <tr>
                                    <th align="center"></th>    
                                    <th align="center"></th>
                                </tr>
                            </thead>
                            <tbody>`;
    for (let key in block) {
        if (Array.isArray(block[key])) {
            ownerBlockHtml += processIterable(key, block[key], blockId);
        } else if (key !== 'type' && key !== 'dataPageId') {
            ownerBlockHtml += `<tr>
                <td align="left"><strong>${formatKeyToDisplay(key)}</strong></td>
                <td align="right"><textarea class="string-action-description-textarea" id="user-store-${key}-${blockId}"
              hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${key}-${blockId}t" hx-swap="outerHTML"
              title="${key}">${block[key]}</textarea></td>
            </tr>`;
        }
    }
    const newBlock = finishBlockProcessing(ownerBlockHtml);
    return newBlock;
}

export function buildEmployeeBlock(block, blockId, employeeCount, employeeId) {

    let employeeBlockHtml = `<div class="block-item" data-block-id="${blockId} data-page-id=${block.dataPageId}">`;
    if (employeeId === 1) {employeeBlockHtml += buildEmployeeHeadingBlock(employeeCount);}
    employeeBlockHtml += `<h3 id="employee_{employee_id}"><textarea class="subtitle-textarea" id="user-store-employee-${employeeId}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-employee-${employeeId}" hx-swap="outerHTML"
                  title="Employee Name">${block.name}</textarea></h3>`
    employeeBlockHtml += `<table>
                            <thead> 
                                <tr>
                                    <th align="center"></th>    
                                    <th align="center"></th>
                                </tr>
                            </thead>
                            <tbody>`;
    for (let key in block) {
        if (Array.isArray(block[key])) {
            EmployeeBlockHtml += processIterable(key, block[key], blockId);
        } else if (key !== 'type' && key !== 'dataPageId') {
            employeeBlockHtml += `<tr>
                <td align="left"><strong>${formatKeyToDisplay(key)}</strong></td>
                <td align="right"><textarea class="string-action-description-textarea" id="user-store-${key}-${blockId}"
                hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${key}-${blockId}" hx-swap="outerHTML"
                title="${key}">${block[key]}</textarea></td>
            </tr>`;
        }
    }
    const newBlock = finishBlockProcessing(employeeBlockHtml);
    return newBlock;
}
// Function to build a section block block in HTML
export function buildEntryBlock(section, block, blockId, entryId) {
    console.log('Building entry block:', section, block, blockId, entryId);
    let sectionBlockHtml = '';
    // Begin the HTML block
    sectionBlockHtml += `<div class="block-item" data-block-id="${blockId} data-page-id=${block.dataPageId}">`;
    // Add a section title if the entry_id is 1
    if (entryId === 1) {
        sectionBlockHtml += `<h1 id="store-${section}">${section}</h1>`;
    }
    // Iterate over the block features and generate HTML
    for (const feature in block) {
        if (block.hasOwnProperty(feature)) {
            if (feature !== 'type' && feature !== 'dataPageId') {
                if (feature === 'name') {
                    // Add a subtitle textarea for the name feature
                    sectionBlockHtml += `<h3 id="${section}-${entryId}">
                        <textarea class="subtitle-textarea" id="user-store-${section}-${blockId}"
                            hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${section}-${blockId}t" hx-swap="outerHTML"
                            title="${section}">${block['name']}</textarea>
                        </h3>`;
                } else {
                    // Add a description textarea for other features
                    let featureName = formatKeyToDisplay(feature); // Capitalize first letter
                    sectionBlockHtml += `<p>
                        <textarea class="string-action-description-textarea" id="user-store-${section}-${blockId}"
                            hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${section}-${blockId}t" hx-swap="outerHTML"
                            title="${section}">${featureName}: ${block[feature]}</textarea>
                        </p>`;
                }
            }
        }
    }    
    // End the HTML block
    sectionBlockHtml += `</div>`;
    const newBlock = finishBlockProcessing(sectionBlockHtml);
    // console.log(newBlock);
    return newBlock;
}
// Function to build the inventory block in HTML
export function buildInventoryBlock(inventory, blockId) {
    let inventoryBlockHtml = `<div class="block-item" data-block-id="${blockId}">
                                <div class="block classTable frame decoration">
                                    <h5 id="inventory">Inventory</h5>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th align="center">Name</th>
                                                <th align="center">Type</th>
                                                <th align="center">Cost</th>
                                                <th align="center">Properties</th>
                                            </tr>
                                        </thead>
                                        <tbody>`;

    // Iterate through each inventory type
    const inventoryTypes = [
        "core_inventory", 
        "weapons", 
        "armor", 
        "potions", 
        "scrolls", 
        "magical_items", 
        "mundane_items", 
        "miscellaneous_items"
    ];

    inventoryTypes.forEach(type => {
        let inventoryList = inventory[type];
        if (inventoryList && inventoryList.length > 0 && inventoryList[0].name !== "") {
            inventoryList.forEach((item, index) => {
                let properties = item.properties.join(", "); // Convert properties list to a string

                // Create the HTML for each inventory item
                inventoryBlockHtml += `<tr>
                                            <td align="center"><textarea class="string-action-description-textarea" id="user-store-item-name-${blockId}-${index}" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-item-name-${blockId}-${index}" hx-swap="outerHTML" title="Item Name">${item.name}</textarea></td>
                                            <td align="center"><textarea class="string-action-description-textarea" id="user-store-item-type-${blockId}-${index}" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-item-type-${blockId}-${index}" hx-swap="outerHTML" title="Item Type">${item.type}</textarea></td>
                                            <td align="center"><textarea class="string-action-description-textarea" id="user-store-item-cost-${blockId}-${index}" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-item-cost-${blockId}-${index}" hx-swap="outerHTML" title="Item Cost">${item.cost}</textarea></td>
                                            <td align="center"><textarea class="string-action-description-textarea" id="user-store-item-properties-${blockId}-${index}" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-item-properties-${blockId}-${index}" hx-swap="outerHTML" title="Item Properties">${properties}</textarea></td>
                                        </tr>`;
            });
        }
    });

    // Close the HTML string
    inventoryBlockHtml += `</tbody>
                            </table>
                            </div> 
                        </div>`;

    // Return the constructed HTML block
    const newBlock = finishBlockProcessing(inventoryBlockHtml);
    // console.log(newBlock);
    return newBlock;
   
}


