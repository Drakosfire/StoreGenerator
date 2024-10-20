from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from fastapi.templating import Jinja2Templates
from auth_router import router as auth_router
from store_operations import router as store_operations
import os

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY"))

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/saved_data", StaticFiles(directory="saved_data"), name="saved_data")

# Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Routers
app.include_router(auth_router)
app.include_router(store_operations)

@app.get('/')
async def homepage():
    return {"message": "Welcome to the OAuth demo"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=3001)
