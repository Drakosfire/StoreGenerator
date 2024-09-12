
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
                hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-${key}-${blockId}t" hx-swap="outerHTML"
                title="${key}">${block[key]}</textarea></td>
            </tr>`;
        }
    }
    const newBlock = finishBlockProcessing(employeeBlockHtml);
    return newBlock;
}


// # Block of owner table
// def build_owner_block(owner, owner_id, owner_title_block, block_id):
//     # Owner block with values : Name, Race, Class, Description, Personality, Secrets, sd-prompt
    
//     # Process owner values into html
//     owner_name_html = process_into_html('Owner', owner['name'], block_id)
//     owner_race_html = process_into_html('Species', owner['species'], block_id)
//     owner_class_html = process_into_html('Class', owner['class'], block_id)
//     owner_description_html = process_into_html('Description', owner['description'], block_id)
//     owner_personality_html = process_into_html('Personality', owner['personality'], block_id)
//     owner_secrets_html = process_secrets_into_html(owner['secrets'], block_id)
//     # Build owner block html
//     # If owner_id is 1, add owner_title_block to owner_block_html
    
//     owner_block_html = f""""""
//     owner_block_html += f"""<div class="block-item" data-block-id="{block_id}">"""
//     if owner_id == 1:
//         owner_block_html+= owner_title_block
//     owner_block_html += f"""<h3 id="owner_{owner_id}"><textarea class="subtitle-textarea" id="user-store-rumors-{block_id}"
//                   hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-rumors-{block_id}t" hx-swap="outerHTML"
//                   title="Owner Name">{owner['name']}</textarea></h3>"""
//     owner_block_html += f"""<table>
//                                 <thead>
//                                     <tr>
//                                         <th align="center"></th>
//                                         <th align="center"></th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {owner_name_html}
//                                     {owner_race_html}
//                                     {owner_class_html}
//                                     {owner_description_html}
//                                     {owner_personality_html}
//                                     {owner_secrets_html}
//                                 </tbody>
//                             </table>
//                             </div>
//     """
//     return owner_block_html