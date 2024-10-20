from fastapi import APIRouter, Request, HTTPException, File, UploadFile, Form, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import os
import json
import block_builder as block_builder
import store_helper as store_helper
import sd_generator as sd
import httpx
from httpx import AsyncClient
import logging
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the DUNGEONMIND_API_URL with a default value
DUNGEONMIND_API_URL = os.getenv("DUNGEONMIND_API_URL", "http://localhost:7860")
logger.info(f"DUNGEONMIND_API_URL set to: {DUNGEONMIND_API_URL}")

CURRENT_USER_URL = f"{DUNGEONMIND_API_URL}/auth/current-user"  # Add /auth/ to the path

templates = Jinja2Templates(directory="templates")

# Models
class DescriptionRequest(BaseModel):
    user_input: str

class GenerateImageRequest(BaseModel):
    sd_prompt: str

class SaveJsonRequest(BaseModel):
    filename: str
    jsonData: dict

# Add this new function to get the current user
async def get_current_user(request: Request):
    logger.info(f"Attempting to get current user from {DUNGEONMIND_API_URL}/auth/current-user")
    
    # Extract cookies from the incoming request
    cookies = request.cookies

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{DUNGEONMIND_API_URL}/auth/current-user",
                cookies=cookies,
                follow_redirects=True
            )
            logger.info(f"Response status code: {response.status_code}")
            logger.debug(f"Response content: {response.text}")
            
            if response.status_code == 200:
                user_data = response.json()
                logger.info(f"Successfully retrieved user data: {user_data}")
                return user_data
            elif response.status_code == 401:
                logger.warning("User not authenticated")
                return None
            else:
                logger.error(f"Unexpected status code: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"An error occurred while getting current user: {str(e)}")
            return None

# Route to serve the main page
@router.get("/storegenerator", response_class=HTMLResponse)
async def index(request: Request):
    css_files = {
        'all_css': '/static/css/all.css',
        'font_css': '/static/css/css.css?family=Open+Sans:400,300,600,700',
        'bundle_css': '/static/css/bundle.css',
        'style_css': '/static/css/style.css',
        'phb_style_css': '/static/css/5ePHBstyle.css',
        'store_ui_css': '/static/css/storeUI.css'
    }
    return templates.TemplateResponse('storeUI.html', {"request": request, "css_files": css_files})
# Routes for store generator
@router.post('/process-description')
async def process_description(data: DescriptionRequest):
    user_input = data.user_input
    llm_output = store_helper.call_llm_and_cleanup(user_input)
    processed_blocks = block_builder.build_blocks(llm_output, block_builder.block_id)
    return {"html_blocks": processed_blocks, "llm_output": llm_output}

@router.post('/generate-image')
async def generate_image(data: GenerateImageRequest):
    sd_prompt = data.sd_prompt
    if not sd_prompt:
        raise HTTPException(status_code=400, detail="Missing sd_prompt")
    try:
        image_url = sd.preview_and_generate_image(sd_prompt)
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/save-json')
async def save_generated_data(request: Request, data: SaveJsonRequest, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_id = current_user.get('sub')
    user_directory = os.path.join('saved_data', user_id, data.filename)
    os.makedirs(user_directory, exist_ok=True)

    file_path = os.path.join(user_directory, f'{data.filename}.json')
    try:
        with open(file_path, 'w') as json_file:
            json.dump(data.jsonData, json_file, indent=4)
        return {"message": "Data saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# Helper function to check allowed file extensions
def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Route to upload images and save them
@router.post('/upload-image')
async def upload_image(
    request: Request,
    image: UploadFile = File(...),
    directoryName: str = Form(...),
    blockId: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    if not allowed_file(image.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_id = current_user.get('sub')
    user_directory = os.path.join('saved_data', user_id, directoryName)
    os.makedirs(user_directory, exist_ok=True)

    filename = f"{blockId}_{image.filename}"
    image_path = os.path.join(user_directory, filename)

    try:
        with open(image_path, "wb") as buffer:
            buffer.write(image.file.read())
        return {"fileUrl": image_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list-loading-images")
async def list_loading_images():
    # Path to the folder containing loading images
    loading_images_folder = os.path.join('static', 'images', 'loadingMimic')
    try:
        # List all files in the directory
        files = os.listdir(loading_images_folder)
        # Filter and get only the image files
        image_files = [f"/static/images/loadingMimic/{file}" for file in files if file.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
        return {"images": image_files}
    except FileNotFoundError:
        return {"images": []}

@router.get("/list-saved-stores")
async def list_saved_stores(request: Request, current_user: dict = Depends(get_current_user)):
    print("Listing saved stores")
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DUNGEONMIND_API_URL}/store/list-saved-stores",
            cookies=request.cookies
        )
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return {"stores": []}
        else:
            raise HTTPException(status_code=response.status_code, detail="Error fetching saved stores")

@router.get("/load-store")
async def load_store(storeName: str, request: Request, current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DUNGEONMIND_API_URL}/store/load-store?storeName={storeName}",
            cookies=request.cookies
        )
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="Store not found")
        else:
            raise HTTPException(status_code=response.status_code, detail="Error loading store")
