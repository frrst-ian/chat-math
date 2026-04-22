from core.config import settings

def save_video(local_path: str, public_id: str) -> dict:
    """
    Returns {"url": str, "public_id": str | None}
    """
    if settings.STORAGE_BACKEND == "cloudinary":
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )
        result = cloudinary.uploader.upload(
            local_path,
            resource_type="video",
            public_id=public_id,
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}

    return {"url": local_path, "public_id": None}