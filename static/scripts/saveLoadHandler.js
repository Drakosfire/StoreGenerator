import { getState, updateState } from "./state.js";
import { initializeTextareaResizing } from "./handleTextareas.js";
import { uploadImages } from "./imageHandler.js";
import { iterateThroughBlocks } from "./jsonToBlocks.js";
import { clearBlocks } from "./utils.js";


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
    console.log('JSON Data:', jsonData);
    let title = '';
    for (const blockId in jsonData.storeData) {
        if (jsonData.storeData[blockId].type === 'title') {
            title = jsonData.storeData[blockId].title;
            break;
        }
    }
    let sanitizedTitle = title.replace(/\W+/g, '_').trim('_');

    // Prepare image data for upload
    let imagesToUpload = [];
    for (const blockId in jsonData.storeData) {
        const block = jsonData.storeData[blockId];
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
                jsonData.storeData[blockId].imgUrl = fileUrl;
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
    console.log('Saved JSON data:', jsonData);
    updateState('jsonData', jsonData.storeData);
    initializeSavedStoresDropdown();
}

export function loadHandler() {
    clearBlocks();
    let state = getState();
    console.log('State:', state);
    let blocks = state.jsonData.storeData;
    console.log('jsonData:', state.jsonData);
    console.log('Blocks:', blocks);
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

// Function to fetch the list of saved stores from the server
export async function fetchSavedStores() {
    try {
        const response = await fetch('/list-saved-stores');
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched saved stores:', data);
            return data;
        } else if (response.status === 401) {
            console.log('User not logged in');
            return { stores: [], message: 'Please log in to view saved stores' };
        } else {
            console.error('Failed to fetch saved stores');
            return { stores: [], message: 'Failed to fetch saved stores' };
        }
    } catch (error) {
        console.error('Error fetching saved stores:', error);
        return { stores: [], message: 'Error fetching saved stores' };
    }
}

// Function to populate the dropdown with saved stores
function populateSavedStoresDropdown(data) {
    const dropdown = document.getElementById('savedStoresDropdown');
    const loadButton = document.getElementById('loadButton');
    dropdown.innerHTML = '';  // Clear any existing options

    if (data.stores && data.stores.length > 0) {
        data.stores.forEach((store) => {
            const option = document.createElement('option');
            option.value = store;
            option.textContent = store;  // Display the store name
            dropdown.appendChild(option);
        });
        dropdown.disabled = false;
        loadButton.disabled = false;
    } else {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = data.message || "No saved stores available";
        dropdown.appendChild(option);
        dropdown.disabled = true;
        loadButton.disabled = true;
    }
    console.log('Dropdown populated:', dropdown);
}

// New function to initialize the dropdown
export async function initializeSavedStoresDropdown() {
    const data = await fetchSavedStores();
    populateSavedStoresDropdown(data);
}

// Modify loadSelectedStore to handle the case when no store is selected
export async function loadSelectedStore() {
    const dropdown = document.getElementById('savedStoresDropdown');
    const selectedStore = dropdown.value;  // Get the selected store's name
    console.log('Selected store:', selectedStore);

    if (selectedStore) {
        try {
            const response = await fetch(`/load-store?storeName=${encodeURIComponent(selectedStore)}`);
            if (response.ok) {
                const responseData = await response.json();
                console.log('Loaded response data:', responseData);
                updateState('jsonData', responseData);
                loadHandler();
            } else {
                console.error('Failed to load the store');
                alert('Failed to load the store. Please try again.');
            }
        } catch (error) {
            console.error('Error loading the store:', error);
            alert('Error loading the store. Please try again.');
        }
    } else {
        alert('Please select a store to load.');
    }
}





