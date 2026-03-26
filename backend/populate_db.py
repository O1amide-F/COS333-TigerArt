import requests
import psycopg2

DB_NAME = "museum_app"
DB_USER = "postgres"
DB_PASSWORD = "your_password"
DB_HOST = "localhost"
DB_PORT = "5432"

OBJECTS_URL = "https://data.artmuseum.princeton.edu/objects"
MAKERS_URL = "https://data.artmuseum.princeton.edu/makers"


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    objects = requests.get(OBJECTS_URL).json()

    for obj in objects:
        objectid = obj.get("objectid")
        title = obj.get("displaytitle")
        displaymaker = obj.get("displaymaker")
        department = obj.get("department")
        classification = obj.get("classification")
        medium = obj.get("medium")
        displaydate = obj.get("displaydate")
        on_view = obj.get("on_view")

        cur.execute("""
            INSERT INTO artworks
            (objectid, title, displaymaker, department, classification, medium, displaydate, on_view)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (objectid) DO NOTHING;
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

    makers = requests.get(MAKERS_URL).json()

    for maker in makers:
        makerid = maker.get("makerid")
        displayname = maker.get("displayname")
        nationality = maker.get("nationality")
        begin_date = maker.get("begindate")
        end_date = maker.get("enddate")
        bio = maker.get("displaybio")

        cur.execute("""
            INSERT INTO makers
            (makerid, displayname, nationality, begin_date, end_date, bio)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (makerid) DO NOTHING;
        """, (makerid, displayname, nationality, begin_date, end_date, bio))

    cur.execute("""
        INSERT INTO users (name)
        VALUES (%s);
    """, ("Test User",))

    cur.execute("""
        INSERT INTO user_preferences (user_id, preference_type, preference_value)
        VALUES (%s, %s, %s);
    """, (1, "classification", "Painting"))

    cur.execute("""
        INSERT INTO user_preferences (user_id, preference_type, preference_value)
        VALUES (%s, %s, %s);
    """, (1, "department", "European Art"))

    cur.execute("""
        INSERT INTO saved_artworks (user_id, objectid)
        VALUES (%s, %s);
    """, (1, 1))

    cur.execute("""
        INSERT INTO recommendation_cache (user_id, objectid, reason, score)
        VALUES (%s, %s, %s, %s);
    """, (1, 1, "matches Painting", 0.95))

    news_data = [
        ("Princeton Art Museum Opens New Wing", "Featuring contemporary works from emerging artists"),
        ("Student Exhibition: Semester Showcase", "Over 40 students present original work this Friday"),
        ("Artist Talk: Digital Futures", "Panel discussion on AI and artistic practice"),
        ("New Acquisitions Announced", "Museum collection grows with 12 new pieces")
    ]

    for name, sub in news_data:
        cur.execute("""
            INSERT INTO news_items (name, sub)
            VALUES (%s, %s);
        """, (name, sub))

    conn.commit()
    cur.close()
    conn.close()

    print("Museum tables populated successfully!")


if __name__ == "__main__":
    main()