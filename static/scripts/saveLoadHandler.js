import { getState, updateState } from "/static/scripts/state.js";
import { initializeTextareaResizing } from "/static/scripts/handleTextareas.js";
import { uploadImages } from "/static/scripts/imageHandler.js";
import { iterateThroughBlocks } from "/static/scripts/jsonToBlocks.js";


// Function to save JSON data to the server
async function saveJson(dataToSend) {
    return fetch('/save-json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            return data;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Main save handler
export async function saveHandler() {
    let state = getState();
    let jsonData = state.jsonData;
    // console.log('JSON Data:', jsonData);
    let title = '';
    for (const blockId in jsonData) {
        if (jsonData[blockId].type === 'title') {
            title = jsonData[blockId].title;
            break;
        }
    }
    let sanitizedTitle = title.replace(/\W+/g, '_').trim('_');

    // Prepare image data for upload
    let imagesToUpload = [];
    for (const blockId in jsonData) {
        const block = jsonData[blockId];
        if (block.type === 'image' && block.imgUrl !== '') {
            console.log('Image block:', block);
            imagesToUpload.push({
                blockId: blockId, imgUrl: block.imgUrl
            });
        }
    }

    try {
        // Upload images and get new URLs
        if (imagesToUpload.length > 0) {
            const uploadedImages = await uploadImages(imagesToUpload, sanitizedTitle);
            uploadedImages.forEach(({ blockId, fileUrl }) => {
                jsonData[blockId].imgUrl = fileUrl;
            });
        }

        // Prepare data to send to the backend
        let dataToSend = {
            filename: sanitizedTitle,
            jsonData: jsonData
        };

        // Save the JSON data to the server
        await saveJson(dataToSend);
    } catch (error) {
        console.error('Error during save process:', error);
    }
    updateState('jsonData', jsonData);
}

export function loadHandler(elements) {
    const { blockContainerPage } = elements;
    const { pageContainer } = elements;

    let state = getState();
    let blocks = state.jsonData;


    let ownerCount = 0;
    let employeeCount = 0;
    for (const [blockId, block] of Object.entries(blocks)) {
        if (block.type === 'owner') {
            ownerCount++;
        }
        if (block.type === 'employee') {
            employeeCount++;
        }
    }

    // Future feature: allow for indexing position on page

    // let blockIndex = 0;
    // for (const block of Object.values(pageBlocks)) {
    //     block['page-container-index'] = blockIndex++;
    // }

    iterateThroughBlocks(blocks, ownerCount, employeeCount);
    initializeTextareaResizing();
}





