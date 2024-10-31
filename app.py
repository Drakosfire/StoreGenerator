from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from fastapi.templating import Jinja2Templates
from store_operations import router as store_operations
from debug_router import debug_router
import os
import logging

app = FastAPI()

allowed_hosts = ["localhost",
                     "127.0.0.1",
                     "0.0.0.0",
                     "http://0.0.0.0:3001",
                     "https://dev.dungeonmind.net",
                     "storegenerator"]
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_hosts,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add SessionMiddleware
app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv("SESSION_SECRET_KEY"),
    session_cookie="dungeonmind_session",
    max_age=3600,
    path="/",
    # secure=True, # This is not a kwarg for SessionMiddleware
    https_only=False,
    same_site="None",
    domain=".dungeonmind.net"  # Allow cross-site requests
)

# Static files
app.mount("/storegenerator/static", StaticFiles(directory="static"), name="static")

# Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Routers

app.include_router(store_operations)
app.include_router(debug_router, prefix="/debug")

# # Add logging to help debug
# logger = logging.getLogger(__name__)

# @app.middleware("http")
# async def log_requests(request: Request, call_next):
#     logger.debug(f"Incoming request: {request.method} {request.url.path}")
#     response = await call_next(request)
#     logger.debug(f"Response status: {response.status_code}")
#     return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
