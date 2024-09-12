//handleTextareas.js

export function adjustTextareaHeight(el, offset = 5) {
    if (el.scrollHeight > 16){
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + offset + 8 + 'px';
    }
}

export function initializeTextareaResizing() {
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
    let offset;  // Declare offset here

    classes.forEach(className => {
        if (className === 'description-textarea') {
            // console.log('Class is ', className, 'offset is 10');
            offset = 10;
        } else {
            offset = 5;
        }

        // console.log('Initializing textareas for class:', className);
        // console.log(document.querySelectorAll(`.${className}`));
        const textareas = document.querySelectorAll(`.${className}`);
        textareas.forEach(textarea => {  
            // console.log('Textarea found:', textarea);                                          
        
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

export function lockTextareas() {
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

export function unlockTextareas() {
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

