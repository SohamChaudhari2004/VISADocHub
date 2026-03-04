import base64
import httpx
from config import settings


# Image extensions use vision API; documents use OCR API
_IMAGE_EXTS = {"png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "tif"}


async def run_ocr(file_path: str) -> str:
    """Send a document to Mistral and return raw extracted text.

    - PDFs go to the dedicated OCR endpoint (mistral-ocr-latest).
    - Images go to the chat/completions vision endpoint (pixtral)
      because the OCR endpoint rejects image/* MIME types.
    """
    if not settings.MISTRAL_API_KEY:
        raise RuntimeError("MISTRAL_API_KEY is not set. Cannot run OCR.")

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    file_b64 = base64.b64encode(file_bytes).decode("utf-8")
    ext = file_path.rsplit(".", 1)[-1].lower()

    if ext in _IMAGE_EXTS:
        return await _ocr_via_vision(file_b64, ext)
    else:
        return await _ocr_via_document(file_b64, ext)


async def _ocr_via_document(file_b64: str, ext: str) -> str:
    """Use Mistral OCR endpoint for PDFs and other document types."""
    mime_map = {"pdf": "application/pdf"}
    mime_type = mime_map.get(ext, "application/pdf")

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.mistral.ai/v1/ocr",
            headers={
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-ocr-latest",
                "document": {
                    "type": "document_url",
                    "document_url": f"data:{mime_type};base64,{file_b64}",
                },
            },
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Mistral OCR API error: {response.status_code} — {response.text}"
        )

    data = response.json()
    pages = data.get("pages", [])
    text_parts = [p.get("markdown", "") for p in pages if p.get("markdown")]
    return "\n\n".join(text_parts) if text_parts else ""


async def _ocr_via_vision(file_b64: str, ext: str) -> str:
    """Use Mistral vision model for images (JPG, PNG, etc.)."""
    mime_map = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "webp": "image/webp",
        "gif": "image/gif",
        "bmp": "image/bmp",
        "tiff": "image/tiff",
        "tif": "image/tiff",
    }
    mime_type = mime_map.get(ext, "image/jpeg")

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-small-latest",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "Extract ALL text visible in this image. "
                                    "Include every word, number, date, and label. "
                                    "If this is a photo of a person (e.g. a visa or "
                                    "passport photo), describe what you see and note "
                                    "that it is a photo. Return raw text only."
                                ),
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{file_b64}",
                                },
                            },
                        ],
                    }
                ],
            },
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Mistral Vision API error: {response.status_code} — {response.text}"
        )

    data = response.json()
    return data["choices"][0]["message"]["content"]
