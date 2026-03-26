import json
import requests
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="your_cloud_name",
    api_key="your_api_key",
    api_secret="your_api_secret"
)

OBJECTS_URL = "https://data.artmuseum.princeton.edu/objects"


def main():
    objects = requests.get(OBJECTS_URL).json()
    saved_data = []

    for obj in objects:
        objectid = obj.get("objectid")
        media = obj.get("media", [])

        if not media:
            continue

        first_media = media[0]
        image_link = first_media.get("uri")

        if not image_link:
            continue

        result = cloudinary.uploader.upload(image_link)
        cloudinary_url = result["secure_url"]

        saved_data.append({
            "objectid": objectid,
            "image_url": cloudinary_url,
            "is_primary": True
        })

        print(f"Uploaded image for artwork {objectid}")

    with open("cloudinary_images.json", "w") as f:
        json.dump(saved_data, f, indent=4)

    print("Done uploading all artwork images to Cloudinary!")


if __name__ == "__main__":
    main()