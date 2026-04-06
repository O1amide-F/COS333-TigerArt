import os
import json

count = 0

for filename in os.listdir("objects_data"):
    if filename.endswith(".json"):
        filepath = os.path.join("objects_data", filename)

        with open(filepath, "r", encoding="utf-8") as f:
            obj = json.load(f)

        media = obj.get("media", [])

        if not media:
            continue

        # checking how many on_view objects there are
        on_view = obj.get("on_view")
        if not on_view:
            continue

        first_media = media[0]
        base_uri = first_media.get("uri")

        if base_uri:
            count += 1

print("Total images that will be uploaded:", count)