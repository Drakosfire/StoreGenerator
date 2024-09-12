// Plan, don't build json from scratch, start with template loaded into state. This will be updated with each generation.
// Then update the existing key value pairs of the existing state variable.
// This will lead to a refactor of how the initial page is built. Ultimately less code because exctract blocks is redundant anyway.

function processBlocksIntoJson(container) { 
    // Selecting all elements with the 'block-item' class
    const blocks = container.querySelectorAll('.block-item');
    
    blocks.forEach((block, index) => {
        const blockContent = block.innerHTML;
        const blockItem = document.createElement('div');
        blockItem.classList.add('block-item');
        blockItem.innerHTML = blockContent;
        
        // Assigning unique block ID
        const blockId = `block-${index}`;
        blockItem.setAttribute('data-block-id', blockId);
        
        // Setting the page ID and other attributes
        const pageId = 'block-container';
        blockItem.setAttribute('data-page-id', pageId);
        blockItem.setAttribute('draggable', true);
        
        // Add event listeners for drag and drop functionality
        blockItem.addEventListener('dragstart', handleDragStart);
        blockItem.addEventListener('dragend', handleDragEnd);
        
        console.log(`Loaded block with ID: ${blockId}`);
        
        // Append block to the container
        blockContainerPage.appendChild(blockItem);
    });
    
    // Store the initial positions of the blocks (if needed for drag and drop)
    storeInitialPositions(blockContainer);
    
} 



// Function to collect all blocks and organize into JSON format
function processContainersForSave(elements){
    // need to instantiate a json container, this needs serious review
    const jsonData = {}
        
        try {
            if (elements.blockContainerPage.children.length === 1) {
                console.log('block-container empty');
                
            }          
            const containerBlocks = processBlocksIntoJson(elements.blockContainerPage)
            jsonData.appendChild(containerBlocks)
            
            }
        catch (error) {
                console.error('Error processing BlockContainerPage into Blocks:', error);
        }
        try {
            if (elements.pageContainer.children.length === 0) {
                console.log('page-container empty');
                   
            }
            const pageBlocks = processBlocksIntoJson(elements.pageContainer)
            jsonData.appendChild(pageBlocks)
        }
        catch (error) {
            console.error('Error processing pageContainer into Blocks:', error);
        }
        return jsonData

    }

export function saveGeneratedData(elements) {
    const jsonData = processContainersForSave(elements)
    let state = getState()
    state.llm_output = jsonData

    fetch('/save-generated-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}