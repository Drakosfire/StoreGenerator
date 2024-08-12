// Waits for DOM content to be fully loaded and assigns critical elements to variables.
let initialPositions = [];
document.addEventListener("DOMContentLoaded", function() {
    const blockContainer = document.getElementById('blockContainer');
    let blockContainerPage = document.getElementById('block-page');
    const pageContainer = document.getElementById('pages');
    const trashArea = document.getElementById('trashArea');
    const resetButton = document.getElementById('resetButton');
    let currentPage = pageContainer.querySelector('.block.monster.frame.wide');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    const closeModal = document.getElementsByClassName('close')[0];
    const MAX_COLUMN_HEIGHT = 847; 

    if (!blockContainer || !pageContainer || !trashArea || !currentPage) {
        console.error('Required elements are null');
        return;
    }
    if (!modal) {
        console.error('modal element not found');
        return;
    }
    if (!modalImg) {
        console.error('modalImg element not found');
        return;
    }
    if (!captionText) {
        console.error('captionText element not found');
        return;
    }
    if (!closeModal) {
        console.error('closeModal element not found');
        return;
    }
    
    // Event delegation for image clicks
    blockContainer.addEventListener('click', function(event) {
        console.log('Click detected in blockContainer:', event.target);
        if (event.target.tagName === 'IMG' && event.target.id.startsWith('generated-image-')) {
            console.log('Image clicked for modal display. Image ID:', event.target.id);
            modal.style.display = 'block';
            modalImg.src = event.target.src;
            captionText.innerHTML = event.target.alt;
        } else {
            console.log('Clicked element is not an image or does not match ID pattern.');
        }
    });

    // Function to close the modal
    closeModal.onclick = function() {
        modal.style.display = "none";
    }

    // Function to close the modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById('submitDescription').addEventListener('click', function() {
    const userInput = document.getElementById('user-description').value;
    // Clear the block container before inserting new blocks
    blockContainerPage.innerHTML = '';
    document.getElementById('add-page-button').addEventListener('click', addPage);
    document.getElementById('remove-page-button').addEventListener('click', removePage);

    fetch('http://127.0.0.1:5000/process-description', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        initialPositions.length = 0; // Clear the initialPositions array
        insertHtmlBlocks(data.html_blocks);
        const blocks = blockContainerPage.querySelectorAll('.block-item');
        blocks.forEach(block => {
            block.setAttribute('data-page-id', 'block-container');
            block.setAttribute('draggable', true);
            block.addEventListener('dragstart', handleDragStart);
            block.addEventListener('dragend', handleDragEnd);
        });
        storeInitialPositions();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
    // Print Function
    window.printPageContainer = function() {
        var pageContainer = document.getElementById('pages');
        if (pageContainer) {
            var printContents = pageContainer.innerHTML;
            var originalContents = document.body.innerHTML;

            document.body.innerHTML = printContents;

            window.print();

            document.body.innerHTML = originalContents;
        } else {
            console.error('Element with ID "pageContainer" not found.');
        }
    }

    // Store initial positions of the blocks
    function storeInitialPositions() {
        const blocks = blockContainer.querySelectorAll('.block-item');
        blocks.forEach((block, index) => {
            const blockId = block.getAttribute('data-block-id');
            if (!blockId) {
                console.error(`Block at index ${index} is missing data-block-id`);
            }
            initialPositions.push({
                id: blockId,
                index: index
            });
        });
        console.log('Initial positions:', initialPositions);
    }

    function sortBlocksById() {
        // Select all blocks inside the block-container
        const blocks = Array.from(blockContainerPage.querySelectorAll('.block-item'));
        console.log('Blocks in blockContainerPage:', blocks);
    
        // Sort the blocks based on their block-id attribute
        blocks.sort((a, b) => {
            const idA = parseInt(a.getAttribute('data-block-id'), 10);
            const idB = parseInt(b.getAttribute('data-block-id'), 10);
            return idA - idB; // Ascending order
        });
    
        // Clear the block-container before re-appending the sorted blocks
        blockContainerPage.innerHTML = '';
    
        // Re-append the blocks in the sorted order
        blocks.forEach(block => blockContainerPage.appendChild(block));
    
        console.log('Blocks have been sorted and re-appended based on block-id');
    }

    function reinsertBlock(blockContainerPage, blockId, innerHTML) {
        const originalPosition = initialPositions.find(pos => pos.id === blockId);
        console.log('Original position:', originalPosition);
    
        if (originalPosition) {
            const blocks = blockContainerPage.querySelectorAll('.block-item');
            console.log('Blocks in blockContainerPage:', blocks);
    
            // Adding debugging output for index details
            console.log(`Attempting to insert block with ID: ${blockId} at original index: ${originalPosition.index}`);
    
            const newBlock = document.createElement('div');
            newBlock.classList.add('block-item');
            newBlock.setAttribute('data-block-id', blockId);
            newBlock.setAttribute('data-page-id', 'block-container');
            newBlock.innerHTML = innerHTML;
            newBlock.setAttribute('draggable', true);
            newBlock.addEventListener('dragstart', handleDragStart);
            newBlock.addEventListener('dragend', handleDragEnd);
    
            if (originalPosition.index < blocks.length) {
                const referenceNode = blocks[originalPosition.index];
    
                // Debugging output to ensure the correct reference node is identified
                console.log(`Reference node index: ${originalPosition.index}, Node:`, referenceNode);
    
                if (referenceNode && referenceNode.parentNode === blockContainerPage) {
                    console.log(`Inserting before block at index: ${originalPosition.index}`);
                    blockContainerPage.insertBefore(newBlock, referenceNode);
                } else {
                    console.warn('Reference node does not belong to blockContainerPage, appending to the end');
                    blockContainerPage.appendChild(newBlock);
                }
            } else {
                console.log('Original index exceeds current blocks, appending block to the end');
                blockContainerPage.appendChild(newBlock);
            }
        } else {
            console.warn('Original position not found, appending block to the end of blockContainerPage');
            const newBlock = document.createElement('div');
            newBlock.classList.add('block-item');
            newBlock.setAttribute('data-block-id', blockId);
            newBlock.setAttribute('data-page-id', 'block-container');
            newBlock.innerHTML = innerHTML;
            newBlock.setAttribute('draggable', true);
            newBlock.addEventListener('dragstart', handleDragStart);
            newBlock.addEventListener('dragend', handleDragEnd);
    
            blockContainerPage.appendChild(newBlock);
        }
    
        console.log(`Restored block with ID: ${blockId}`);
    }
    
    function insertHtmlBlocks(blocks) {
        console.log('blockContainerPage = ', blockContainerPage)
        console.log('List of blocks:', blocks);
        const parser = new DOMParser();
        
        blocks.forEach(blockHtml => {
            console.log('Original blockHtml:', blockHtml);
            // Parse the HTML string
            const doc = parser.parseFromString(blockHtml, 'text/html');
            const block = doc.body.firstChild;
            if (block) {
                blockContainerPage.appendChild(block); // Append the parsed block to the container
                console.log('Appended block:', block);
            }
        });
        // console.log('Final state of blockContainer:', blockContainer.innerHTML);
        initializeTextareaResizing();
    }

    storeInitialPositions();

    function adjustTextareaHeight(el) {
        if (el.scrollHeight > 16){
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
        }
    }

    function initializeTextareaResizing() {
        const classes = [
            'description-textarea',
            'user-description-textarea',
            'heading-textarea',
            'properties-textarea',
            'string-stat-textarea',
            'string-action-description-textarea',
        ];

        classes.forEach(className => {
            const textareas = document.querySelectorAll(`.${className}`);
            textareas.forEach(textarea => {                                            
            
                // Adjust height on page load
                adjustTextareaHeight(textarea);
                // Adjust height on input
                textarea.addEventListener('input', function() {
                    adjustTextareaHeight(textarea);
                    console.log('Input event triggered for:', textarea.id); // Debugging line
                });
            });
        });
    }

    // Initial run on page load
    initializeTextareaResizing();

    async function extractBlocks() {
        try {
            if (blockContainerPage.children.length > 0) {
                console.log('Blocks already loaded, skipping fetch');
                return;
            }
            
            const response = await fetch('template_update.html');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            // Selecting all elements with the 'block-item' class
            const blocks = doc.querySelectorAll('.block-item');
            
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
            storeInitialPositions();
            
        } catch (error) {
            console.error('Error fetching and parsing template_update.html:', error);
        }
    }
    

     blockContainer.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('generate-image-button')) {
            const blockId = event.target.getAttribute('data-block-id');
            generateImage(blockId);
        }
        });

    // Function to generate image
    function generateImage(blockId) {
        const sdPromptElement = document.getElementById(`user-storefront-prompt-${blockId}`);
        const imageElement = document.getElementById(`generated-image-${blockId}`);
        
        if (!sdPromptElement) {
            console.error('Element with ID user-storefront-prompt not found');
            return;
        }

        if (!imageElement) {
            console.error('Element with ID generated-image not found');
            return;
        }

        const sdPrompt = sdPromptElement.value;

        fetch('http://127.0.0.1:5000/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sd_prompt: sdPrompt })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);
            imageElement.src = data.image_url;
            imageElement.style.display = 'block';

            // Log the image element's HTML structure
            console.log('Updated imageElement HTML:', imageElement.outerHTML);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
            }
    function lockTextareas() {
        const textareas = document.querySelectorAll('textarea');
        
        textareas.forEach(textarea => {
            textarea.setAttribute('disabled', true);
        });
        
        const descriptionTextareas = document.querySelectorAll('.description-textarea');
        
        descriptionTextareas.forEach(descriptionTextarea => {
            descriptionTextarea.removeAttribute('contenteditable');
        });
        
        console.log('All textareas have been locked.');
    }

    function unlockTextareas() {
        const textareas = document.querySelectorAll('textarea');
        
        textareas.forEach(textarea => {
            textarea.removeAttribute('disabled');
        });
        
        const descriptionTextareas = document.querySelectorAll('.description-textarea');
        
        descriptionTextareas.forEach(descriptionTextarea => {
            descriptionTextarea.setAttribute('contenteditable', 'true');
            console.log(`Contenteditable for element with ID "${descriptionTextarea.id}" is now: ${descriptionTextarea.contentEditable}`);
        });
        
        console.log('All textareas have been unlocked.');
    }
    
    function handleDragStart(e) {
        lockTextareas();
        const target = e.target.closest('.block-item, .block-content');
        if (!target) {
            console.error('Drag started for an element without a valid target');
            return;
        }
        const blockId = target.getAttribute('data-block-id');
        const pageId = target.getAttribute('data-page-id');
        if (!blockId) {
            console.error('Drag started for an element without a data-block-id');
            return;
        }
        if (!pageId) {
            console.error('Drag started for an element without a data-page-id');
            return;
        }
        
        // Store the block ID and inner HTML in the data transfer object
        const innerHTML = target.innerHTML;
        e.dataTransfer.setData('block-id', blockId);
        e.dataTransfer.setData('text/plain', innerHTML); // Store inner HTML
        e.dataTransfer.setData('data-page-id', pageId); // Store original page ID
        e.dataTransfer.effectAllowed = 'move';
        target.style.opacity = '0.4';

        // Create an invisible drag image
        const dragImage = document.createElement('div');
        dragImage.style.width = '1px';
        dragImage.style.height = '1px';
        dragImage.style.opacity = '0';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);

        console.log(`Drag started for block ID: ${blockId} page ID: ${pageId}`);
    }

    function handleDragEnd(e) {
        const target = e.target.closest('.block-item, .block-content');
        if (target) {
            target.style.opacity = '1'; // Reset the opacity
            const blockId = target.getAttribute('data-block-id');
            console.log(`Drag ended for block ID: ${blockId}`);
        }

        // Remove highlight classes from pages and blocks
        document.querySelectorAll('.highlight-page').forEach(el => el.classList.remove('highlight-page'));
        document.querySelectorAll('.highlight-block').forEach(el => el.classList.remove('highlight-block'));
        document.querySelectorAll('.highlight-block-top').forEach(el => el.classList.remove('highlight-block-top'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        // Get the element currently under the cursor
        const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

        if (elementUnderCursor) {
            // Check if the element is a block or textarea
            if (elementUnderCursor.classList.contains('block-item')) {
                console.log('Dragging over a block-item:', elementUnderCursor);
                console.log('Block ID:', elementUnderCursor.getAttribute('data-block-id'));
            } else if (elementUnderCursor.tagName === 'TEXTAREA') {
                console.log('Dragging over a textarea:', elementUnderCursor);
            } else {
                // Log other elements if needed
                console.log('Dragging over another element:', elementUnderCursor.tagName);
            }
        }  
         // Check if the drop target is a TEXTAREA or any other non-droppable area
        if (e.target.tagName === 'TEXTAREA' || e.target.closest('.block-item')) {
            e.dataTransfer.dropEffect = 'none'; // Indicate that drop is not allowed
            return;
        }
        e.dataTransfer.dropEffect = 'move'; // Indicate that drop is allowed

        const targetPage = e.target.closest('.page');
        if (targetPage) {
            targetPage.classList.add('highlight-page'); // Add highlight class for pages                
            }

        const targetBlock = e.target.closest('.block-item, .block-content');
        if (targetBlock) {
            const bounding = targetBlock.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            if (offset > bounding.height / 2) {
                targetBlock.classList.add('highlight-block');
                targetBlock.classList.remove('highlight-block-top');
            } else {
                targetBlock.classList.add('highlight-block-top');
                targetBlock.classList.remove('highlight-block');
            }
        }
    }
  
    function handleDrop(e) {
        e.preventDefault();
        // Ensure we are not dropping into a textarea or another block
        if (e.target.classList.contains('block-item', 'block-content', 'description-textarea') || e.target.tagName === 'TEXTAREA') {
            console.log('Cannot drop block inside another block or textarea');
            return;
        }
        const blockId = e.dataTransfer.getData('block-id');
        const originalPageId = e.dataTransfer.getData('data-page-id');
        const innerHTML = e.dataTransfer.getData('text/plain');
        console.log(`Drop event for block ID: ${blockId} from page ID: ${originalPageId}`);
        
        if (blockId && originalPageId) {
            const originalBlock = document.querySelector(`[data-block-id="${blockId}"]`);
            const newPage = e.target.closest('.page');
            console.log(`Over page ${newPage} from page ID: ${originalPageId}`);
            const newPageId = newPage.getAttribute('data-page-id');
            
            // Ensure the original block exists before proceeding
            if (!originalBlock || !newPage) {
                console.error(`Block with ID ${blockId} on page ${originalPageId} not found`);
                unlockTextareas();
                return;
            }

            const newBlockContent = document.createElement('div');
            newBlockContent.classList.add('block-content');
            newBlockContent.innerHTML = originalBlock.innerHTML; // Transfer inner content only

            // Add necessary attributes and event listeners
            newBlockContent.setAttribute('data-block-id', blockId);
            newBlockContent.setAttribute('data-page-id', newPageId);
            console.log('newPageID:', newPageId);
            newBlockContent.setAttribute('draggable', true);
            newBlockContent.addEventListener('dragstart', handleDragStart);
            newBlockContent.addEventListener('dragend', handleDragEnd);

            const target = e.target.closest('.block-item, .block-content');
            let targetColumn = 1;
            if (target) {
                const bounding = target.getBoundingClientRect();
                const offset = e.clientY - bounding.top;

                console.log('Drop target found:', target);
                console.log('Bounding rectangle:', bounding);
                console.log('Offset from top:', offset);
                console.log('Target height:', bounding.height);
                console.log('Insert before or after decision point (height / 2):', bounding.height / 2);

                targetColumn = getColumnFromOffset(target, offset);
                if (offset > bounding.height / 2) {
                    console.log('Inserting after the target');
                    target.parentNode.insertBefore(newBlockContent, target.nextSibling);
                    unlockTextareas();
                } else {
                    console.log('Inserting before the target');
                    target.parentNode.insertBefore(newBlockContent, target);
                    unlockTextareas();
                }

                // Remove highlight borders
                target.style['border-bottom'] = '';
                target.style['border-top'] = '';
            } else {
                console.log('No valid drop target found, appending to the end');
                newPage.querySelector('.block.monster.frame.wide').appendChild(newBlockContent);
                unlockTextareas();
            }

            // Remove the original block from the original container
            originalBlock.parentNode.removeChild(originalBlock);

            // Reset opacity of dragged element
            newBlockContent.style.opacity = '1';
            console.log(`Moved existing block with ID: ${blockId} to page ID: ${newPageId}`);
            initializeTextareaResizing();
            // Adjust layouts
            if (originalPageId !== 'block-container') {
                adjustPageLayout(originalPageId);
            }
            adjustPageLayout(newPageId, targetColumn);
            } else {
            console.log('No data transferred');
        }
        
    }
                    
        function getColumnFromOffset(block, offset) {
            const page = block.closest('.page');
            if (!page) return 1;
            const columnWrapper = page.querySelector('.columnWrapper');
            const columnWrapperRect = columnWrapper.getBoundingClientRect();
            const relativeOffset = offset - columnWrapperRect.left; // Calculate the offset relative to the column wrapper
            const columnWidth = columnWrapper.clientWidth / 2; // Assuming two columns

            // Log details for debugging
            console.log('Block offset:', offset);
            console.log('Relative offset:', relativeOffset);
            
            const columnNumber = Math.ceil(relativeOffset / columnWidth);

            // Ensure the column number is within valid bounds (1 or 2)
            const validColumnNumber = Math.min(Math.max(columnNumber, 1), 2);

            
            return validColumnNumber;
        }


         // Function to get the height of a column by index
        function getColumnHeights(pageElement) {
            const columns = [0, 0]; // Assuming two columns for simplicity
            const blocks = pageElement.querySelectorAll('.block-content');
            blocks.forEach(block => {
                const column = getColumnFromOffset(block, block.getBoundingClientRect().left);
                columns[column - 1] += block.offsetHeight;
            });
            return columns;
        }
        
        function adjustPageLayout(pageId) {
            const page = document.querySelector(`[data-page-id="${pageId}"]`);
            if (!page) {
                console.error(`Page with ID ${pageId} not found`);
                return;
            }

            const columnHeights = getColumnHeights(page);
            console.log(`Total height of columns in ${pageId}: ${columnHeights}`);

            for (let i = 0; i < columnHeights.length; i++) {
                if (columnHeights[i] > MAX_COLUMN_HEIGHT) {
                    console.log(`Column ${i + 1} in ${pageId} exceeds max height, total height: ${columnHeights[i]}px`);
                    handleColumnOverflow(page, i + 1);
                }
            }
        }

        let pageCounter = 1;
        // Function to create new page
        function addPage() {
            const newPage = document.createElement('div');
            newPage.classList.add('page');
            newPage.setAttribute('data-page-id', `page-${pageCounter}`);
            newPage.id = `page-${pageCounter}`;
                            
            const columnWrapper = document.createElement('div');
            columnWrapper.classList.add('columnWrapper');

            const newMonsterFrame = document.createElement('div');
            newMonsterFrame.classList.add('block', 'monster', 'frame', 'wide');

            columnWrapper.appendChild(newMonsterFrame);
            newPage.appendChild(columnWrapper);
            pageContainer.appendChild(newPage);

            currentPage = newMonsterFrame;
            console.log(`Created new page with ID: ${newPage.id}`);

            // Add event listeners to the new currentPage
            currentPage.addEventListener('dragover', handleDragOver);
            currentPage.addEventListener('drop', handleDrop);

            pageCounter++;
            return newPage;
        }

        function removePage() {
            const pages = pageContainer.querySelectorAll('.page');
        
            if (pages.length > 1) { // Ensure at least one page remains
                const lastPage = pages[pages.length - 1];
                pageContainer.removeChild(lastPage);
                console.log(`Page removed with ID: ${lastPage.id}`);
            } else {
                console.log('Cannot remove the last page.');
            }
        }

        function handleColumnOverflow(page, targetColumn) {
            console.log(`Handling overflow for page ID: ${page.getAttribute('data-page-id')} in column ${targetColumn}`);
            const blocks = Array.from(page.querySelectorAll('.block-content'));
            let columnHeights = [0, 0];
            let overflowStartIndex = -1;

            // Find the start index where overflow begins in the target column
            blocks.forEach((block, index) => {
                const column = getColumnFromOffset(block, block.getBoundingClientRect().left);
                columnHeights[column - 1] += block.offsetHeight;
                if (columnHeights[targetColumn - 1] > MAX_COLUMN_HEIGHT && overflowStartIndex === -1) {
                    overflowStartIndex = index;
                }
            });

            // If no overflow, return early
            if (overflowStartIndex === -1) {
                return;
            }
            const overflowBlocks = blocks.slice(overflowStartIndex);
            const overflowHeight = overflowBlocks.reduce((acc, block) => acc + block.offsetHeight, 0);

            // If the target column is the first column, check if the second column has enough space
            if (targetColumn === 1) {
                const secondColumnAvailableHeight = MAX_COLUMN_HEIGHT - columnHeights[1];
              
                if (overflowHeight <= secondColumnAvailableHeight) {
                    // Move the overflowing blocks to the second column within the same page
                    overflowBlocks.forEach(block => {
                        const blockWrapper = block.closest('.block.monster.frame.wide');
                        if (blockWrapper) {
                            blockWrapper.appendChild(block);
                            block.setAttribute('data-page-id', page.getAttribute('data-page-id'));
                        }
                    });
                    return;
                }
            }

             // Get the next page if it exists
            const nextPage = getNextPage(page);
            if (nextPage) {
                const nextPageBlocks = nextPage.querySelectorAll('.block-content, .block-item');
                let nextPageColumnHeights = [0, 0];

                nextPageBlocks.forEach(block => {
                    const column = getColumnFromOffset(block, block.getBoundingClientRect().left);
                    nextPageColumnHeights[column - 1] += block.offsetHeight;
                });

                // Check if there's enough space in the target column of the next page
                if (nextPageColumnHeights[targetColumn - 1] + overflowHeight <= MAX_COLUMN_HEIGHT) {
                    const nextPageContainer = nextPage.querySelector('.block.monster.frame.wide');
                    overflowBlocks.forEach(block => {
                        nextPageContainer.appendChild(block);
                        block.setAttribute('data-page-id', nextPage.getAttribute('data-page-id'));
                    });
                    return;
                }

                // If the next page's second column has enough space for overflow from the first column
                if (targetColumn === 1 && nextPageColumnHeights[1] + overflowHeight <= MAX_COLUMN_HEIGHT) {
                    const nextPageContainer = nextPage.querySelector('.block.monster.frame.wide');
                    overflowBlocks.forEach(block => {
                        nextPageContainer.appendChild(block);
                        block.setAttribute('data-page-id', nextPage.getAttribute('data-page-id'));
                    });
                    return;
                }
            }

            // Otherwise, create a new page and move the overflowing blocks there
            const newPage = addPage();
            if (!newPage) {
                console.error('Failed to create a new page');
                return;
            }
            const newMonsterFrame = newPage.querySelector('.block.monster.frame.wide');
            if (!newMonsterFrame) {
                console.error('New monster frame not found in the new page');
                return;
            }

            
            overflowBlocks.forEach(block => {
                newMonsterFrame.appendChild(block);
            });
            console.log(`Moved overflowing blocks to new page with ID: ${newPage.getAttribute('data-page-id')}`);
        }

        // Utility function to get the next page element
        function getNextPage(currentPage) {
            const nextPageId = parseInt(currentPage.getAttribute('data-page-id').split('-')[1]) + 1;
            return document.querySelector(`[data-page-id="page-${nextPageId}"]`);
        }

    // Handle the drop event on the trash area
    function handleTrashDrop(e) {
        e.preventDefault();
        const innerHTML = e.dataTransfer.getData('text/plain');
        const blockId = e.dataTransfer.getData('block-id');
        console.log('Trash Drop event:', e);
        console.log('Dragged block ID to trash:', blockId);

        if (innerHTML && blockId) {
            // Find the dragged element and remove it from the DOM
            let draggedElement = document.querySelector(`[data-block-id="${blockId}"].block-content`);
            if (!draggedElement) {
                draggedElement = document.querySelector(`[data-block-id="${blockId}"].block-item`);
            }
            if (draggedElement && draggedElement.parentElement) {
                draggedElement.parentElement.removeChild(draggedElement);
                console.log(`Removed block with ID: ${blockId} from the page`);
            }

            // Check if the block already exists in the block-container and remove it if it does
            let existingBlock = blockContainer.querySelector(`[data-block-id="${blockId}"].block-content`);
            if (!existingBlock) {
                existingBlock = blockContainer.querySelector(`[data-block-id="${blockId}"].block-item`);
            }
            if (existingBlock && existingBlock.parentElement) {
                existingBlock.parentElement.removeChild(existingBlock);
                console.log(`Removed duplicate block with ID: ${blockId} from block-container`);
            }

            // Ensure the block is appended to the page wrapper inside blockContainer
            let blockContainerPage = blockContainer.querySelector('.page');
            if (!blockContainerPage) {
                blockContainerPage = document.createElement('div');
                blockContainerPage.classList.add('page');
                blockContainerPage.setAttribute('data-page-id', 'block-container');
                blockContainer.appendChild(blockContainerPage);
            }

            // Reinsert the block using the refactored function
        reinsertBlock(blockContainerPage, blockId, innerHTML);
        sortBlocksById();
            } else {
                console.log('No data transferred');
            }
        // Remove the "over" class and reset the background image
        trashArea.classList.remove('over');
        trashArea.style.backgroundImage = "url('./closed-mimic-trashcan.png')";
        initializeTextareaResizing();
    }

    function handleTrashOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        trashArea.classList.add('over');
        trashArea.style.backgroundImage = "url('./mimic_trashcan.png')";
        console.log('Trash over event');
    }

    function handleTrashLeave(e) {
        trashArea.classList.remove('over');
        trashArea.style.backgroundImage = "url('./closed-mimic-trashcan.png')";
        console.log('Trash leave event');
    }

    function handleReset() {
        console.log('Reset button clicked');
        
        // Collect all blocks from all pages
        const allBlocks = [];
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            const blocksOnPage = page.querySelectorAll('[data-block-id]');
            blocksOnPage.forEach(block => {
                const blockId = block.getAttribute('data-block-id');
                allBlocks.push({
                    id: blockId,
                    innerHTML: block.innerHTML
                });
                block.remove();
                console.log(`Removed block with ID: ${blockId} from page ID: ${page.getAttribute('data-page-id')}`);
            });
        });

        // Clear all pages
        pages.forEach(page => page.remove());

        // Clear blockContainer before reinserting blocks
        blockContainer.innerHTML = '';

        // Reinsert blocks back into the blockContainer in their original order
        
        if (!blockContainerPage) {
            blockContainerPage = document.createElement('div');
            blockContainerPage.classList.add('page');
            blockContainerPage.setAttribute('id', 'block-page');
            blockContainer.appendChild(blockContainerPage);
        }
        // Reassign blockContainerPage to the newly created block-page element
        blockContainerPage = document.getElementById('block-page');

        initialPositions.forEach(pos => {
            const blockData = allBlocks.find(block => block.id === pos.id);
            if (blockData) {
                reinsertBlock(blockContainerPage, blockData.id, blockData.innerHTML);
                sortBlocksById();
            }
        });
        addPage();

        console.log('Reset complete, all blocks moved back to block-container');
        initializeTextareaResizing();
    }
   


    pageContainer.addEventListener('dragover', handleDragOver);
    pageContainer.addEventListener('drop', handleDrop);
    
    trashArea.addEventListener('dragover', handleTrashOver);
    trashArea.addEventListener('dragleave', handleTrashLeave);
    trashArea.addEventListener('drop', handleTrashDrop);
    resetButton.addEventListener('click', handleReset);
    extractBlocks();
});
