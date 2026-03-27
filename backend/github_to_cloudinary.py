import json
import requests
import cloudinary
import cloudinary.uploader
import zipfile
import os

cloudinary.config(
    cloud_name="dfftqt3zi",
    api_key="964161348152656",
    api_secret="NiUZN41Ik-peCXJoDvQpZ1s-NFU"
)

OBJECTS_URL = "https://static.artmuseum.princeton.edu/collection-data-sets/objects.zip"

def main():
    response = requests.get(OBJECTS_URL)

    if response.status_code != 200:
        print("Error downloading objects:", response.status_code)
        return

    with open("objects.zip", "wb") as f:
        f.write(response.content)

    with zipfile.ZipFile("objects.zip", "r") as zip_ref:
        zip_ref.extractall("objects_data")

    saved_data = []

    for filename in os.listdir("objects_data"):
        if filename.endswith(".json"):
            filepath = os.path.join("objects_data", filename)

            with open(filepath, "r", encoding="utf-8") as f:
                obj = json.load(f)

            objectid = obj.get("objectid")

            if objectid is None:
                continue

            media = obj.get("media", [])

            if not media:
                continue

            first_media = media[0]
            base_uri = first_media.get("uri")

            if not base_uri:
                continue

            image_link = base_uri + "/full/max/0/default.jpg"

            try:
                result = cloudinary.uploader.upload(image_link)
                cloudinary_url = result["secure_url"]

                saved_data.append({
                    "objectid": objectid,
                    "image_url": cloudinary_url,
                    "is_primary": True
                })

                print(f"Uploaded image for artwork {objectid}")

            except Exception as e:
                # FIX: show real error
                print(f"Skipping artwork {objectid}: {e}")

    with open("cloudinary_images.json", "w", encoding="utf-8") as f:
        json.dump(saved_data, f, indent=4)

    print("Done uploading all artwork images to Cloudinary!")


if __name__ == "__main__":
    main()