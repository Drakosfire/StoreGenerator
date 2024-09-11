// state.js
let initialState = {
    originalContent: null,
    initialPositions: [],
    MAX_COLUMN_HEIGHT: 847,
    currentPage:null,
    jsonData: null,
    blockContainerLoadingImages: [
        "/static/images/loadingMimic/Mimic Chest1.png",
        "/static/images/loadingMimic/Mimic Chest2.png",
        "/static/images/loadingMimic/Mimic Chest3.png",
        "/static/images/loadingMimic/Mimic Chest4.png",
        "/static/images/loadingMimic/Mimic Chest5.png"
    ]
};

export function getState() {
    return initialState;
}

export function updateState(key, value) {
    initialState[key] = value;
}
