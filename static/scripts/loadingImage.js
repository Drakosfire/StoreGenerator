import {getState} from './state.js';

let currentBlockContainerLoadingImageIndex = 0;

export function changeImage() {
    const loadingImage = document.getElementById('loadingImage');
    
    let state = getState();
    loadingImage.src = state.blockContainerLoadingImages[currentBlockContainerLoadingImageIndex];
    currentBlockContainerLoadingImageIndex = (currentBlockContainerLoadingImageIndex + 1) % state.blockContainerLoadingImages.length;
}

// Change the image every 500ms (0.5 seconds)
let animationInterval;

// Function to start the animation
export function startLoadingAnimation() {
    document.getElementById('loadingAnimation').style.display = 'flex';
    animationInterval = setInterval(changeImage, 500);
}

// Function to stop the animation
export function stopLoadingAnimation() {
    clearInterval(animationInterval);
    document.getElementById('loadingAnimation').style.display = 'none';
}