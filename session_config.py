import os
import logging
from starlette.middleware.sessions import SessionMiddleware

logger = logging.getLogger(__name__)

def get_session_config():
    """
    Get standardized session configuration that matches DungeonMindServer.
    This ensures consistent session management across all DungeonMind apps.
    """
    secret_key = os.getenv("SESSION_SECRET_KEY")
    if not secret_key:
        raise ValueError("SESSION_SECRET_KEY environment variable must be set")
    
    # Environment-based configuration
    environment = os.getenv('ENVIRONMENT', 'development')
    is_production = environment == 'production'
    
    config = {
        "secret_key": secret_key,
        "session_cookie": "dungeonmind_session",  # Standardized cookie name
        "max_age": 24 * 60 * 60,  # 24 hours in seconds
        "path": "/",
        "https_only": is_production,  # Only HTTPS in production
        "same_site": "lax",  # Consistent with main auth service
    }
    
    # Only add domain in production
    if is_production:
        config["domain"] = ".dungeonmind.net"
    
    logger.info(f"Session config for {environment} environment: HTTPS={is_production}")
    return config

def add_session_middleware(app):
    """
    Add standardized session middleware to StoreGenerator app.
    
    Args:
        app: FastAPI application instance
    """
    config = get_session_config()
    app.add_middleware(SessionMiddleware, **config)
    logger.info("Added standardized session middleware to StoreGenerator") 