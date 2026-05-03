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

NEWS_URL = "https://artmuseum.princeton.edu/api/tiger-art-news"

def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    # -------- NEWS ----------
    response = requests.get(NEWS_URL)

    if response.status_code != 200:
        print("Error downloading news:", response.status_code)
        return

    news_items = response.json()

    # optional: clear old news first
    cur.execute("TRUNCATE TABLE news_items RESTART IDENTITY;")

    for item in news_items:
        uuid = item.get("uuid")
        title = item.get("title")
        published = item.get("published")
        image_url = item.get("image")
        article_url = item.get("url")

        if not uuid or not title or not article_url:
            continue

        published_date = None
        if published:
            try:
                published_date = datetime.strptime(published.strip(), "%Y-%m-%d").date()
            except ValueError:
                published_date = None

        cur.execute("""
            INSERT INTO news_items
            (uuid, title, published_date, image_url, article_url)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (uuid)
            DO UPDATE SET
                title = EXCLUDED.title,
                published_date = EXCLUDED.published_date,
                image_url = EXCLUDED.image_url,
                article_url = EXCLUDED.article_url;
        """, (uuid, title, published_date, image_url, article_url))

    conn.commit()
    cur.close()
    conn.close()

    print("Museum tables populated successfully!")


if __name__ == "__main__":
    main()