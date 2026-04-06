import json
import psycopg2

DB_NAME = "tigerart_db"
DB_USER = "postgres"
DB_PASSWORD = "cos333"
DB_HOST = "localhost"
DB_PORT = "5432"


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

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