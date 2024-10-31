let config = {
    DUNGEONMIND_BASE_URL: '',
    DUNGEONMIND_API_URL: '',
    ENVIRONMENT: '',
    CLOUDFLARE_ACCOUNT_ID: '',
    CLOUDFLARE_IMAGES_API_TOKEN: ''
};

export async function loadConfig() {
    try {
        const response = await fetch('https://dev.dungeonmind.net/config');
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
