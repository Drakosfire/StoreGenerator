export function buildTitleBlock(block, blockId) {
    let titleBlockHtml = `<div class="block-item" type ="title" data-block-id = ${blockId}><h1>
    <textarea class="title-textarea" id="user-store-title" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-name" hx-swap="outerHTML" title="Name of store">${title}</textarea></h1>
    <div contenteditable="true" class="description-textarea" id="user-store-description"
        hx-post="/update-stats" hx-trigger="change"
        hx-target="#user-monster-description" hx-swap="outerHTML"
        title="Any amount or style of description">
       <p>${block.title} ${block.description} </p>
   </div> `;
    return titleBlockHtml;
}


export function buildImageBlock(block, blockId) {
    let imageBlockHtml = `<div class="block-item" type ="image" data-block-id = ${blockId}>
    <img src="${block.img-url}" alt="Store Image" class="store-image" hx-get="/update-stats" hx-trigger="load" hx-target="#user-store-image" hx-swap="outerHTML" title="Store Image">
    <textarea class="image-textarea" id="user-store-image" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-image" hx-swap="outerHTML" title="Store Image">${block.sdprompt}</textarea>
    </div>`;
    return imageBlockHtml;
}