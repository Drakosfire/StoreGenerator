let DUNGEONMIND_API_URL = '';

export async function loadConfig() {
    try {
        const response = await fetch('/api-config');
        if (response.ok) {
            const config = await response.json();
            DUNGEONMIND_API_URL = config.DUNGEONMIND_API_URL;
            console.log('Loaded DUNGEONMIND_API_URL:', DUNGEONMIND_API_URL);
        } else {
            console.error('Failed to load API configuration');
        }
    } catch (error) {
        console.error('Error loading API configuration:', error);
    }
}

export function getDungeonMindApiUrl() {
    return DUNGEONMIND_API_URL;
}