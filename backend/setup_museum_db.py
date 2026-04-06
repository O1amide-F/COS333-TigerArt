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

    cur.execute("""
        CREATE TABLE IF NOT EXISTS artworks (
            objectid BIGINT PRIMARY KEY,
            title TEXT,
            displaymaker TEXT,
            department TEXT,
            classification TEXT,
            medium TEXT,
            displaydate TEXT,
            on_view BOOLEAN
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS makers (
            makerid BIGINT PRIMARY KEY,
            displayname TEXT,
            nationality TEXT,
            begin_date INT,
            end_date INT,
            bio TEXT
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
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            name TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_preferences (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            preference_type TEXT,
            preference_value TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS saved_artworks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            objectid BIGINT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS recommendation_cache (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            objectid BIGINT,
            reason TEXT,
            score FLOAT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS news_items (
            id SERIAL PRIMARY KEY,
            name TEXT,
            sub TEXT
        );
    """)

    conn.commit()
    cur.close()
    conn.close()

    print("Tables created successfully!")


if __name__ == "__main__":
    main()