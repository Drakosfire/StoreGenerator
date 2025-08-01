from fastapi import APIRouter, Request, HTTPException, File, UploadFile, Form, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import os
import httpx
import logging
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the DUNGEONMIND_API_URL with a default value
DUNGEONMIND_API_URL = os.getenv("DUNGEONMIND_API_URL", "https://dev.dungeonmind.net")
logger.info(f"DUNGEONMIND_API_URL set to: {DUNGEONMIND_API_URL}")

CURRENT_USER_URL = f"{DUNGEONMIND_API_URL}/api/auth/current-user"  # Standardized API path

templates = Jinja2Templates(directory="templates")

# Models
class DescriptionRequest(BaseModel):
    user_input: str

class GenerateImageRequest(BaseModel):
    sd_prompt: str

class SaveJsonRequest(BaseModel):
    filename: str
    jsonData: dict


# Import centralized auth service utilities
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'DungeonMindServer'))

try:
    from auth_serCURRENT_USER_URL = f"{DUNGEONMIND_API_URL}/api/auth/current-user"  # Standardized API path

templates = Jinja2Templates(directory="templates")

# Models
class DescriptionRequest(BaseModel):
    user_input: str

class GenerateImageRequest(BaseModel):
    sd_prompt: str

class SaveJsonRequest(BaseModel):
    filename: str
    jsonData: dict


# Import centralized auth service utilities
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'DungeonMindServer'))

try:
    from auth_service import auth_service, AuthResult, User
    AUTH_SERVICE_AVAILABLE = True
    logger.info("Using centralized auth service")
except ImportError:
    AUTH_SERVICE_AVAILABLE = False
    logger.warning("Centralized auth service not available, using fallback")

# Unified function to get the current user
async def get_current_user(request: Request):
    """
    Get current authenticated user using centralized auth service.
    Falls back to legacy method if auth service unavailable.
    """
    cookies = request.cookies
    
    if AUTH_SERVICE_AVAILABLE:
        try:
            auth_result = await auth_service.get_current_user_from_cookies(cookies)
            if auth_result.authenticated:
                logger.info(f"User authenticated: {auth_result.user.email}")
                return auth_result.user.dict()
            else:
                logger.info(f"User not authenticated: {auth_result.error}")
                return None
        except Exception as e:
            logger.error(f"Auth service error, falling back: {str(e)}")
    
    # Fallback to legacy HTTP request method
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{DUNGEONMIND_API_URL}/api/auth/current-user",
                cookies=cookies,
                follow_redirects=True,
                timeout=30.0
            )
            
            if response.status_code == 200:
                user_data = response.json()
                logger.info(f"Successfully retrieved user data (fallback): {user_data.get('email', 'unknown')}")
                return user_data
            elif response.status_code == 401:
                logger.info("User not authenticated (fallback)")
                return None
            else:
                logger.error(f"Unexpected status code (fallback): {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Fallback auth request failed: {str(e)}")
            return None

# Route to serve the main page
@router.get("/", response_class=HTMLResponse)
@router.get("/storegenerator/", response_class=HTMLResponse)
async def index(request: Request):
    css_files = {
        'all_css': '/static/storegenerator/css/all.css',
        'font_css': '/static/storegenerator/css/css.css?family=Open+Sans:400,300,600,700',
        'bundle_css': '/static/storegenerator/css/bundle.css',
        'style_css': '/static/storegenerator/css/style.css',
        'phb_style_css': '/static/storegenerator/css/5ePHBstyle.css',
        'store_ui_css': '/static/storegenerator/css/storeUI.css'
    }
    return templates.TemplateResponse('storeUI.html', {"request": request, "css_files": css_files})

@router.get('/config')
async def get_config(request: Request):
    logger.info(f"Getting config from {DUNGEONMIND_API_URL}/config")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DUNGEONMIND_API_URL}/config", cookies=request.cookies)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Error fetching config")        

@router.post('/save-json')
async def save_generated_data(request: Request, data: SaveJsonRequest, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{DUNGEONMIND_API_URL}api/store/save-store",
            json={"name": data.filename, **data.jsonData},
            cookies=request.cookies
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Error saving data")

@router.post('/upload-image')
async def upload_image(
    request: Request,
    image: UploadFile = File(...),
    directoryName: str = Form(...),
    blockId: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    async with httpx.AsyncClient() as client:
        files = {"image": (image.filename, image.file, image.content_type)}
        data = {"directoryName": directoryName, "blockId": blockId}
        response = await client.post(
            f"{DUNGEONMIND_API_URL}api/store/upload-image",
            files=files,
            data=data,
            cookies=request.cookies
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Error uploading image")

@router.get("/list-saved-stores")
async def list_saved_stores(request: Request, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DUNGEONMIND_API_URL}api/store/list-saved-stores", cookies=request.cookies)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Error fetching saved stores")

@router.get("/load-store")
async def load_store(storeName: str, request: Request, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DUNGEONMIND_API_URL}api/store/load-store",
            params={"storeName": storeName},
            cookies=request.cookies
        )
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="Store not found")
        else:
            raise HTTPException(status_code=response.status_code, detail="Error loading store")

# @router.get("/list-loading-images")
# async def list_loading_images():
#     # Path to the folder containing loading images
#     loading_images_folder = os.path.join('static', 'images', 'loadingMimic')
#     try:
#         # List all files in the directory
#         files = os.listdir(loading_images_folder)
#         # Filter and get only the image files
#         image_files = [f"/static/storegenerator/images/loadingMimic/{file}" for file in files if file.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
#         return {"images": image_files}
#     except FileNotFoundError:
#         return {"images": []}

