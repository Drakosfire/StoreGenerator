from fastapi import FastAPI, Request, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import ctypes
import store_helper as sh
import block_builder as block_builder
import sd_generator as sd

# Fix for the way Python doesn't release system memory back to the OS
libc = ctypes.cdll.LoadLibrary("libc.so.6")
M_MMAP_THRESHOLD = -3
libc.mallopt(M_MMAP_THRESHOLD, 2**20)

# Initialize the FastAPI application
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/saved_data", StaticFiles(directory="saved_data"), name="saved_data")

# Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Helper function to check allowed file extensions
def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Route to serve the main page
@app.get("/", response_class=HTMLResponse)
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

# Route to handle the incoming POST request with user description
class DescriptionRequest(BaseModel):
    user_input: str

@app.post('/process-description')
async def process_description(data: DescriptionRequest):
    user_input = data.user_input
    print(f"Received user input: {user_input}")
    llm_output = sh.call_llm_and_cleanup(user_input)
    processed_blocks = block_builder.build_blocks(llm_output, block_builder.block_id)
    return {"html_blocks": processed_blocks, "llm_output": llm_output}

# Route to generate an image
class GenerateImageRequest(BaseModel):
    sd_prompt: str

@app.post('/generate-image')
async def generate_image(data: GenerateImageRequest):
    print(f'Received data: {data}')
    sd_prompt = data.sd_prompt

    if not sd_prompt:
        raise HTTPException(status_code=400, detail="Missing sd_prompt")

    try:
        image_url = sd.preview_and_generate_image(sd_prompt)
        print(f"Generated image URL: {image_url}")
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to save the generated data as JSON
class SaveJsonRequest(BaseModel):
    filename: str
    jsonData: dict

@app.post('/save-json')
async def save_generated_data(data: SaveJsonRequest):
    filename = data.filename

    # Path to save the JSON file
    file_path = os.path.join('saved_data', filename, f'{filename}.json')

    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Write the JSON data to the file
        with open(file_path, 'w') as json_file:
            json.dump(data.jsonData, json_file, indent=4)

        return {"message": "Data saved successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to upload images and save them
@app.post('/upload-image')
async def upload_image(image: UploadFile = File(...), directoryName: str = Form(...), blockId: str = Form(...)):
    # Validate and sanitize inputs
    if not allowed_file(image.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    if not directoryName or not blockId:
        raise HTTPException(status_code=400, detail="Invalid directory name or block ID")

    # Ensure the directory exists
    directory_path = os.path.join('saved_data', directoryName)
    os.makedirs(directory_path, exist_ok=True)

    # Save the image with a secure filename
    filename = (f"{blockId}_{image.filename}")
    image_path = os.path.join(directory_path, filename)

    try:
        # Save the image file
        with open(image_path, "wb") as buffer:
            buffer.write(image.file.read())

        # Return the URL for the image
        file_url = f'/saved_data/{directoryName}/{filename}'
        return {"fileUrl": file_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860, reload=True)
