from datetime import datetime
import requests
import psycopg2
import zipfile
import json
import os
import shutil

DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")

OBJECTS_URL = "https://static.artmuseum.princeton.edu/collection-data-sets/objects.zip"
MAKERS_URL = "https://static.artmuseum.princeton.edu/collection-data-sets/makers.zip"


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    # -------- OBJECTS ZIP: download only if missing --------
    if not os.path.exists("objects.zip"):
        print("Downloading objects.zip...")
        response = requests.get(OBJECTS_URL)

        if response.status_code != 200:
            print("Error downloading objects:", response.status_code)
            cur.close()
            conn.close()
            return

        with open("objects.zip", "wb") as f:
            f.write(response.content)
    else:
        print("Using existing objects.zip")

    # -------- EXTRACT only if missing --------
    if not os.path.exists("objects_data"):
        print("Extracting objects.zip...")
        with zipfile.ZipFile("objects.zip", "r") as zip_ref:
            zip_ref.extractall("objects_data")
    else:
        print("Using existing extracted objects_data")

    # -------- LOAD OBJECTS --------
    for filename in sorted(os.listdir("objects_data")):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join("objects_data", filename)

        with open(filepath, "r", encoding="utf-8") as f:
            obj = json.load(f)

        objectid = obj.get("objectid")
        title = obj.get("displaytitle")
        displaymaker = obj.get("displaymaker")
        department = obj.get("department")
        classification = obj.get("classification")
        medium = obj.get("medium")
        displaydate = obj.get("displaydate")
        on_view = obj.get("on_view")
        texts = obj.get("texts", [])

        if not on_view:
            continue

        # Find gallery label text
        gallery_label_text = None
        for text_entry in texts:
            if (
                text_entry.get("textpurpose") == "Gallery Label"
                and text_entry.get("texttype") == "Online"
            ):
                gallery_label_text = text_entry.get("textentryhtml")
                break

        # Insert/update artwork row, including new column
        cur.execute("""
            INSERT INTO artworks
            (
                objectid,
                title,
                displaymaker,
                department,
                classification,
                medium,
                displaydate,
                on_view,
                gallery_label_text
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (objectid) DO UPDATE SET
                title = EXCLUDED.title,
                displaymaker = EXCLUDED.displaymaker,
                department = EXCLUDED.department,
                classification = EXCLUDED.classification,
                medium = EXCLUDED.medium,
                displaydate = EXCLUDED.displaydate,
                on_view = EXCLUDED.on_view,
                gallery_label_text = EXCLUDED.gallery_label_text;
        """, (
            objectid,
            title,
            displaymaker,
            department,
            classification,
            medium,
            displaydate,
            on_view,
            gallery_label_text
        ))

        # Optional: insert tags
        if classification:
            cur.execute("""
                INSERT INTO artwork_tags (objectid, tag_type, tag_value)
                VALUES (%s, %s, %s);
            """, (objectid, "classification", classification))

        if department:
            cur.execute("""
                INSERT INTO artwork_tags (objectid, tag_type, tag_value)
                VALUES (%s, %s, %s);
            """, (objectid, "department", department))

        if medium:
            cur.execute("""
                INSERT INTO artwork_tags (objectid, tag_type, tag_value)
                VALUES (%s, %s, %s);
            """, (objectid, "medium", medium))

    conn.commit()
    cur.close()
    conn.close()

    print("Museum tables populated successfully!")


if __name__ == "__main__":
    main()