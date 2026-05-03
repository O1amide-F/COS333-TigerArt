import json
import psycopg2
import os

DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    cur.execute('''
    TRUNCATE artwork_images;
    DELETE FROM artwork_images;
    ''')

    with open("on_display_cloudinary_images.json", "r") as f:
        images = json.load(f)

    for item in images:
        objectid = item["objectid"]
        image_url = item["image_url"]
        is_primary = item["is_primary"]

        cur.execute("""
            INSERT INTO artwork_images (objectid, image_url, is_primary)
            VALUES (%s, %s, %s);
        """, (objectid, image_url, is_primary))

    conn.commit()
    cur.close()
    conn.close()

    print("Cloudinary links saved to PostgreSQL!")


if __name__ == "__main__":
    main()