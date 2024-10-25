let config = {
    DUNGEONMIND_BASE_URL: '',
    DUNGEONMIND_API_URL: '',
    ENVIRONMENT: ''
};

export async function loadConfig() {
    try {
        const response = await fetch('http://localhost:7860/config');
        if (!response.ok) {
            throw new Error('Failed to load configuration');
        }
        const data = await response.json();
        config = { ...config, ...data };
        console.log('Configuration loaded:', config);
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
}

export function getConfig() {
    return config;
}
