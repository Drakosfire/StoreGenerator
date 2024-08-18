
// Globals
let originalContent = null;
let initialPositions = [];

// Waits for DOM content to be fully loaded and assigns critical elements to variables.
document.addEventListener("DOMContentLoaded", function() {
    // constants and variables. 
    let blockContainer = document.getElementById('blockContainer');
    let blockContainerPage = document.getElementById('block-page');
    const pageContainer = document.getElementById('pages');
    const trashArea = document.getElementById('trashArea');
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
  
    // Event delegation for click events
    document.addEventListener('click', function(event) {
            // Log the click event for debugging
            console.log('Click detected:', event.target);
    
            // Handle image clicks for modal display
            if (event.target.tagName === 'IMG' && event.target.id.startsWith('generated-image-')) {
                console.log('Image clicked for modal display. Image ID:', event.target.id);
                modal.style.display = 'block';
                modalImg.src = event.target.src;
                captionText.innerHTML = event.target.alt;
            }
    
            // Handle modal close button
            if (event.target.id === 'closeModal') {
                console.log('Close button clicked for modal. Element ID:', event.target.id);
                modal.style.display = "none";
            }
    
            // Handle modal close when clicking outside of the modal content
            if (event.target === modal) {
                console.log('Clicked outside of modal content, closing modal.');
                modal.style.display = "none";
            }
    
            // Handle submission of the description
            if (event.target.id === 'submitDescription') {
                console.log('Submit description button clicked. Element ID:', event.target.id);
                const userInput = document.getElementById('user-description').value;
                blockContainerPage.innerHTML = ''; // Clear the block container before inserting new blocks
    
                fetch('/process-description', {
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
            }
    
            // Handle print button click
            if (event.target.id === 'printButton') {
                console.log('Print button clicked. Element ID:', event.target.id);
                openPrintModal();
            }
    
            // Handle generate image button click
            if (event.target.classList.contains('generate-image-button')) {
                const blockId = event.target.getAttribute('data-block-id');
                console.log('Generate image button clicked. Block ID:', blockId);
                generateImage(blockId);
            }
    
            // Handle page add button
            if (event.target.id === 'addPageButton') {
                console.log('Add page button clicked. Element ID:', event.target.id);
                addPage();
            }
    
            // Handle page remove button
            if (event.target.id === 'removePageButton') {
                console.log('Remove page button clicked. Element ID:', event.target.id);
                removePage();
            }
    
            // Handle toggle button click
            if (event.target.id === 'toggleButton') {
                console.log('Toggle button clicked. Element ID:', event.target.id);
                toggleAllTextBlocks();
            }
    
            // Handle autofill button click
            if (event.target.id === 'autofillButton') {
                console.log('Autofill button clicked. Element ID:', event.target.id);
                autofillBlocks();
            }
    
            // Handle reset button click
            if (event.target.id === 'resetButton') {
                console.log('Reset button clicked. Element ID:', event.target.id);
                handleReset();
            }
        });
   

    function toggleAllTextBlocks() {
        const pageContainer = document.querySelector('.page-container');
        const textareas = pageContainer.querySelectorAll('.image-textarea');
        const generateButtons = pageContainer.querySelectorAll('.generate-image-button');
    
        let isAnyVisible = Array.from(textareas).some(textarea => textarea.style.display === 'block');
    
        if (isAnyVisible) {
            // Hide all textareas and buttons
            textareas.forEach(textarea => textarea.style.display = 'none');
            generateButtons.forEach(btn => btn.style.display = 'none');
        } else {
            // Show all textareas and buttons
            textareas.forEach(textarea => textarea.style.display = 'block');
            generateButtons.forEach(btn => btn.style.display = 'inline-block');
            
        }
    }
    function autofillBlocks() {
        console.log('Autofill button clicked');

        const blocks = Array.from(blockContainer.querySelectorAll('.block-item'));        
        let currentPage = pageContainer.querySelector('.page'); 
        // If no existing page is found, create the first page
        if (!currentPage) {
            currentPage = addPage();
            console.log('No existing pages found. Created the first page:', currentPage.id);
        }

        // Iterate over each block and move it to the pageContainer
        blocks.forEach(block => {
            block.setAttribute('class', 'block-page');
            block.setAttribute('data-page-id', currentPage.getAttribute('data-page-id'));
            // Append the block to the current page's columnWrapper
            const newPage = currentPage.querySelector('.block.monster.frame.wide');
            newPage.appendChild(block);
            console.log(`Moved block with ID: ${block.getAttribute('data-block-id')} to page with ID: ${currentPage.getAttribute('data-page-id')}`);
            // Adjust the layout after adding the block; this function handles creating a new page if needed
            adjustPageLayout(currentPage.getAttribute('data-page-id'));

            // Check if a new page was created and update curtrrentPage accordingly
            const lastPageInContainer = pageContainer.querySelector('.page:last-child');
            if (lastPageInContainer !== currentPage) {
                currentPage = lastPageInContainer;
                console.log('Moved to a new page:', currentPage.getAttribute('data-page-id'));            
            }
        });
        console.log('Autofill complete, all blocks moved to page-container');
    }

    // This works in principal when deployed. It looks like shit but it does function. 
    function openPrintModal() {
        // Clone the original content before modifying
        originalContent = document.body.cloneNode(true);
        var brewRendererContent = document.getElementById('brewRenderer').innerHTML;

        // Create a hidden iframe or select an existing one
        var printIframe = document.createElement('iframe');
        printIframe.style.position = 'fixed';
        printIframe.style.width = '0px';
        printIframe.style.height = '0px';
        printIframe.style.border = 'none'; // Make the iframe invisible
        document.body.appendChild(printIframe);
        // Write the modal content to the iframe
        var iframeDoc = printIframe.contentWindow.document;
        iframeDoc.open();

        fetch('/proxy.html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ htmlContent: brewRendererContent }),
        })
        .then(response => response.text())
        .then(html => {
            document.getElementById('modalPreviewContent').innerHTML = html;

            var modal = document.getElementById('printModal');
            modal.style.display = "block";

            document.getElementById('print-button').onclick = function() {
                printIframe.contentWindow.print();
            };

            document.getElementById('cancel-button').onclick = function() {
                closePrintModal();
            };

            document.getElementsByClassName('close')[0].onclick = function() {
                closePrintModal();
            };
            iframeDoc.write(document.getElementById('modalPreviewContent').innerHTML);
            iframeDoc.close();
             // Wait for the content to load, then trigger the print dialog
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
        })
        
        .catch(error => {
            console.error('Error loading the print preview:', error);
        });
    }

    function closePrintModal() {
        var modal = document.getElementById('printModal');
        modal.style.display = "none";
        document.getElementById('modalPreviewContent').innerHTML = '';
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

    function sortBlocksById(blockContainerPage) {
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
        console.log('Contents of blocks', blocks);
        blocks.forEach(block => blockContainerPage.appendChild(block));
    
        console.log('Blocks have been sorted and re-appended based on block-id');
        console.log('Contents of blockContainerPage', blockContainerPage);
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

    function adjustTextareaHeight(el, offset = 0) {
        if (el.scrollHeight > 16){
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + offset + 'px';
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
            'image-textarea',
            'title-textarea'
        ];

        classes.forEach(className => {
            if (className === 'description-textarea') {
                console.log('Class is ', className, 'offset is 5');
                offset = 10;
            } else {
                offset = 0;
            }

            console.log('Initializing textareas for class:', className);
            console.log(document.querySelectorAll(`.${className}`));
            const textareas = document.querySelectorAll(`.${className}`);
            textareas.forEach(textarea => {  
                console.log('Textarea found:', textarea);                                          
            
                // Adjust height on page load
                adjustTextareaHeight(textarea, offset);
                // Adjust height on input
                textarea.addEventListener('input', function() {
                    adjustTextareaHeight(textarea);
                    console.log('Input event triggered for:', textarea.id); // Debugging line
                });
            });
        });
    }



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
        initializeTextareaResizing();
    }
 
    // Function to generate image
    function generateImage(blockId) {
        const sdPromptElement = document.getElementById(`sdprompt-${blockId}`);
        const imageElement = document.getElementById(`generated-image-${blockId}`);
        
        if (!sdPromptElement) {
            console.error('Element with ID sdprompt not found');
            return;
        }

        if (!imageElement) {
            console.error('Element with ID generated-image not found');
            return;
        }

        const sdPrompt = sdPromptElement.value;

        fetch('/generate-image', {
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
        });
        
        console.log('All textareas have been unlocked.');
    }
    
    function handleDragStart(e) {
        lockTextareas();
        const target = e.target.closest('.block-item, .block-page');
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
        const target = e.target.closest('.block-item, .block-page');
        if (target) {
            target.style.opacity = '1'; // Reset the opacity
            const blockId = target.getAttribute('data-block-id');
            console.log(`Drag ended for block ID: ${blockId}`);
        }

        // Remove highlight classes from pages and blocks
        document.querySelectorAll('.highlight-page').forEach(el => el.classList.remove('highlight-page'));
        document.querySelectorAll('.highlight-block').forEach(el => el.classList.remove('highlight-block'));
        document.querySelectorAll('.highlight-block-top').forEach(el => el.classList.remove('highlight-block-top'));
        unlockTextareas()

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

        const targetBlock = e.target.closest('.block-item, .block-page');
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
        if (e.target.classList.contains('block-item', 'block-page', 'description-textarea') || e.target.tagName === 'TEXTAREA') {
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
                
                return;
            }

            const newBlockContent = document.createElement('div');
            newBlockContent.classList.add('block-page');
            newBlockContent.innerHTML = originalBlock.innerHTML; // Transfer inner content only

            // Add necessary attributes and event listeners
            newBlockContent.setAttribute('data-block-id', blockId);
            newBlockContent.setAttribute('data-page-id', newPageId);
            console.log('newPageID:', newPageId);
            newBlockContent.setAttribute('draggable', true);
            newBlockContent.addEventListener('dragstart', handleDragStart);
            newBlockContent.addEventListener('dragend', handleDragEnd);

            const target = e.target.closest('.block-item, .block-page');
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
                   
                } else {
                    console.log('Inserting before the target');
                    target.parentNode.insertBefore(newBlockContent, target);
                    
                }

                // Remove highlight borders
                target.style['border-bottom'] = '';
                target.style['border-top'] = '';
            } else {
                console.log('No valid drop target found, appending to the end');
                newPage.querySelector('.block.monster.frame.wide').appendChild(newBlockContent);
                
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
            const blocks = pageElement.querySelectorAll('.block-page');
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
                const blocks = lastPage.querySelectorAll('.block-page'); // Check for blocks inside the last page
        
                if (blocks.length > 0) {
                    // If blocks are present, block the removal and display a warning
                    console.log(`Cannot remove page with ID: ${lastPage.id} because it contains ${blocks.length} block(s).`);
                    alert(`Cannot remove this page because it contains ${blocks.length} block(s). Please remove the blocks first.`);
                } else {
                    // If no blocks are present, allow removal
                    pageContainer.removeChild(lastPage);
                    console.log(`Page removed with ID: ${lastPage.id}`);
                }
            } else {
                console.log('Cannot remove the last page.');
            }
        }

        function handleColumnOverflow(page, targetColumn) {
            console.log(`Handling overflow for page ID: ${page.getAttribute('data-page-id')} in column ${targetColumn}`);
            const blocks = Array.from(page.querySelectorAll('.block-page'));
            let columnHeights = [0, 0];
            let overflowStartIndex = -1;

            // Find the start index where overflow begins in the target column
            blocks.forEach((block, index) => {
                const column = getColumnFromOffset(block, block.getBoundingClientRect().left);
                columnHeights[column - 1] += block.offsetHeight;
                if (column === 2 && columnHeights[1] > MAX_COLUMN_HEIGHT && overflowStartIndex === -1) {
                    overflowStartIndex = index;
                }
            });

            // If no overflow, return early
            if (overflowStartIndex === -1) {
                return;
            }
            const overflowBlocks = blocks.slice(overflowStartIndex);
            const overflowHeight = overflowBlocks.reduce((acc, block) => acc + block.offsetHeight, 0);

             // Get the next page if it exists
            const nextPage = getNextPage(page);
            if (nextPage) {
                const nextPageBlocks = nextPage.querySelectorAll('.block-page, .block-item');
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
                block.setAttribute('data-page-id', newPage.getAttribute('data-page-id'));
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
            let draggedElement = document.querySelector(`[data-block-id="${blockId}"].block-page`);
            if (!draggedElement) {
                draggedElement = document.querySelector(`[data-block-id="${blockId}"].block-item`);
            }
            if (draggedElement && draggedElement.parentElement) {
                draggedElement.parentElement.removeChild(draggedElement);
                console.log(`Removed block with ID: ${blockId} from the page`);
            }

            // Check if the block already exists in the block-container and remove it if it does
            let existingBlock = blockContainer.querySelector(`[data-block-id="${blockId}"].block-page`);
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
        sortBlocksById(blockContainerPage);
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
            console.log(`Processing page with ID: ${page.getAttribute('data-page-id')}`);
            
            const blocksOnPage = page.querySelectorAll('[data-block-id]');
            
            blocksOnPage.forEach(block => {
                block.setAttribute('display', 'block');
                const blockId = block.getAttribute('data-block-id');
                allBlocks.push({
                    id: blockId,
                    innerHTML: block.innerHTML
                });
                block.remove();
                console.log(`Removed block with ID: ${blockId} from page ID: ${page.getAttribute('data-page-id')}`);
            });
        });

        // Log blocks collected
        console.log('All blocks collected:', allBlocks);

        // Clear all pages
        pages.forEach(page => {
            console.log(`Removing page with ID: ${page.getAttribute('data-page-id')}`);
            page.remove();
        });

        // Clear blockContainer before reinserting blocks
        console.log('Clearing blockContainer...');
        blockContainer.innerHTML = '';

       // Create a new page inside the blockContainer
        blockContainerPage = document.createElement('div');
        blockContainerPage.classList.add('page');
        blockContainerPage.setAttribute('id', 'block-page');
        blockContainer.appendChild(blockContainerPage);
        console.log('Created new blockContainerPage');

        // Reassign blockContainerPage to the newly created block-page element
        console.log('blockContainerPage reassigned to:', blockContainerPage);

        // Reinsert blocks back into the blockContainer in their original order
        initialPositions.forEach(pos => {
            const blockData = allBlocks.find(block => block.id === pos.id);
            
            if (blockData) {
                console.log(`Reinserting block with ID: ${blockData.id} into blockContainerPage`);
                reinsertBlock(blockContainerPage, blockData.id, blockData.innerHTML);
                sortBlocksById(blockContainerPage);
            } else {
                console.log(`Block with ID: ${pos.id} not found in collected blocks.`);
            }
        });

    // Add a new page after reset
    let currentPage = pageContainer.querySelector('.page'); 
    console.log('Current page:', currentPage);
        // If no existing page is found, create the first page
        if (!currentPage) {
            currentPage = addPage();
            currentPage.setAttribute('data-page-id', 'page-0');
            console.log('No existing pages found. Created the first page:', currentPage.id);
        }
            

    console.log('Reset complete, all blocks moved back to block-container');
    initializeTextareaResizing();
}


    
    // Event listeners for drag and drop functionality
    blockContainer.addEventListener('dragover', handleDragOver);
    blockContainer.addEventListener('drop', handleDrop);
    pageContainer.addEventListener('dragover', handleDragOver);
    pageContainer.addEventListener('drop', handleDrop);
    
    // Event listeners for trash area
    trashArea.addEventListener('dragover', handleTrashOver);
    trashArea.addEventListener('dragleave', handleTrashLeave);
    trashArea.addEventListener('drop', handleTrashDrop);
    
    extractBlocks();
});
