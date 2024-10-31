from fastapi import APIRouter, Response

# Create a new router
debug_router = APIRouter()

@debug_router.get("/set-test-cookie")
async def set_test_cookie(response: Response):
    response.set_cookie(
        key="test_cookie",
        value="test_value",
        httponly=True,
        secure=True,
        samesite="none",
        domain="dev.dungeonmind.net",
        path="/",
        max_age=3600
    )
    return {"message": "Test cookie set"}
