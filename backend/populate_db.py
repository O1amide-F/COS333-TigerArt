import requests
import psycopg2
import zipfile
import json
import os
import shutil

DB_NAME = "tigerart_db"
DB_USER = "postgres"
DB_PASSWORD = "cos333"
DB_HOST = "localhost"
DB_PORT = "5432"

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

    # Clear old data first
    cur.execute("TRUNCATE TABLE artwork_tags, artwork_images, makers, artworks RESTART IDENTITY CASCADE;")
    conn.commit()

    # Remove old extracted folders/files if they exist
    if os.path.exists("objects_data"):
        shutil.rmtree("objects_data")
    if os.path.exists("makers_data"):
        shutil.rmtree("makers_data")
    if os.path.exists("objects.zip"):
        os.remove("objects.zip")
    if os.path.exists("makers.zip"):
        os.remove("makers.zip")

    # -------- OBJECTS --------
    response = requests.get(OBJECTS_URL)

    if response.status_code != 200:
        print("Error downloading objects:", response.status_code)
        return

    with open("objects.zip", "wb") as f:
        f.write(response.content)

    with zipfile.ZipFile("objects.zip", "r") as zip_ref:
        zip_ref.extractall("objects_data")

    for filename in sorted(os.listdir("objects_data")):
        if filename.endswith(".json"):
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

            if not on_view:
                continue

            cur.execute("""
                INSERT INTO artworks
                (objectid, title, displaymaker, department, classification, medium, displaydate, on_view)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """, (objectid, title, displaymaker, department, classification, medium, displaydate, on_view))

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

    # -------- MAKERS --------
    response = requests.get(MAKERS_URL)

    if response.status_code != 200:
        print("Error downloading makers:", response.status_code)
        return

    with open("makers.zip", "wb") as f:
        f.write(response.content)

    with zipfile.ZipFile("makers.zip", "r") as zip_ref:
        zip_ref.extractall("makers_data")

    for filename in sorted(os.listdir("makers_data")):
        if filename.endswith(".json"):
            filepath = os.path.join("makers_data", filename)

            with open(filepath, "r", encoding="utf-8") as f:
                maker = json.load(f)

            makerid = maker.get("makerid")

            if makerid is None:
                print("Skipping maker with no makerid:", maker.get("displayname"))
                continue

            displayname = maker.get("displayname")
            nationality = maker.get("nationality")
            begin_date = maker.get("begindate")
            end_date = maker.get("enddate")
            bio = maker.get("displaybio")

            cur.execute("""
                INSERT INTO makers
                (makerid, displayname, nationality, begin_date, end_date, bio)
                VALUES (%s, %s, %s, %s, %s, %s);
            """, (makerid, displayname, nationality, begin_date, end_date, bio))

    conn.commit()
    cur.close()
    conn.close()

    print("Museum tables populated successfully!")


if __name__ == "__main__":
    main()