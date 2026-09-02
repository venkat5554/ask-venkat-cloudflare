from fastapi import FastAPI, Request
from fastapi.responses import Response
from workers import asgi


app = FastAPI(
    title="Ask Venkat",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "runtime": "cloudflare-workers-python",
    }


@app.get("/api/test")
async def api_test():
    return {
        "message": "Ask Venkat Cloudflare backend is running."
    }


@app.get("/{path:path}")
async def frontend(path: str, request: Request):
    env = request.scope["env"]

    asset_url = f"https://assets.local/{path}"
    resp = await env.ASSETS.fetch(asset_url)

    body = await resp.bytes()
    headers = dict(resp.headers)

    return Response(
        content=body,
        status_code=resp.status,
        headers=headers,
    )


Default = asgi.entrypoint(app)