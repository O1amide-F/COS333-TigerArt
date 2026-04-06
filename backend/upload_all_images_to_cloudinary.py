import json
import requests
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="dc4nhrcsm",
    api_key="558446319571127",
    api_secret="*********************************"
)

OBJECTS_URL = "https://data.artmuseum.princeton.edu/objects"


def main():
    objects = requests.get(OBJECTS_URL).json()
    saved_data = []
    count = 0

    for obj in objects:
        objectid = obj.get("objectid")
        media = obj.get("media", [])
        on_view = obj.get("on_view")

        if not media:
            continue

        if not on_view:
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

        count += 1

        print(f"Uploaded image for artwork {objectid}")

    with open("on_display_cloudinary_images.json", "w") as f:
        json.dump(saved_data, f, indent=4)

    print("Done uploading all artwork images to Cloudinary!")
    print("Num of images uploaded:", count)


if __name__ == "__main__":
    main()