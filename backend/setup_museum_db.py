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

    cur.execute("""
        CREATE TABLE IF NOT EXISTS artworks (
            objectid BIGINT PRIMARY KEY,
            title TEXT,
            displaymaker TEXT,
            department TEXT,
            classification TEXT,
            medium TEXT,
            displaydate TEXT,
            on_view BOOLEAN,
            gallery_label_text TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS artwork_images (
            id SERIAL PRIMARY KEY,
            objectid BIGINT,
            image_url TEXT,
            is_primary BOOLEAN
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS artwork_tags (
            id SERIAL PRIMARY KEY,
            objectid BIGINT,
            tag_type TEXT,
            tag_value TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_preferences (
            id SERIAL PRIMARY KEY,
            user_id TEXT,
            preference_type TEXT,
            preference_value TEXT,
            UNIQUE (user_id, preference_type)
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS saved_artworks (
            id SERIAL PRIMARY KEY,
            user_id TEXT,
            objectid BIGINT,
            UNIQUE (user_id, objectid)
        );
    """)


    cur.execute("""
        CREATE TABLE IF NOT EXISTS news_items (
            id SERIAL PRIMARY KEY,
            title TEXT,
            uuid TEXT UNIQUE,
            published_date DATE,
            image_url TEXT,
            article_url TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS recently_viewed (
            id        SERIAL PRIMARY KEY,
            user_id   TEXT NOT NULL,
            objectid  BIGINT NOT NULL,
            viewed_at TIMESTAMP DEFAULT NOW(),
            UNIQUE (user_id, objectid)
        );
    """)

    conn.commit()
    cur.close()
    conn.close()

    print("Tables created successfully!")


if __name__ == "__main__":
    main()