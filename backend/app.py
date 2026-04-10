from flask import Flask, jsonify
import psycopg2
import psycopg2.extras

app = Flask(__name__)

DB_NAME = "tigerart_db"
DB_USER = "postgres"
DB_PASSWORD = "cos333"
DB_HOST = "localhost"
DB_PORT = "5432"


def get_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        cursor_factory=psycopg2.extras.RealDictCursor
    )


def get_for_you_items(cur):
    cur.execute("""
        SELECT objectid, title, medium, displaydate, displaymaker
        FROM artworks
        ORDER BY objectid
        LIMIT 4;
    """)
    rows = cur.fetchall()

    items = []
    for row in rows:
        items.append({
            "id": row["objectid"],
            "title": row["title"] or "Untitled",
            "about": f'{row["medium"] or "Unknown medium"} - {row["displaydate"] or "Unknown date"} - {row["displaymaker"] or "Unknown artist"}'
        })
    return items


def get_exhibit_sections(cur):
    sections = []

    cur.execute("""
        SELECT objectid, title, medium
        FROM artworks
        WHERE classification = 'Painting'
        ORDER BY objectid
        LIMIT 4;
    """)
    rows = cur.fetchall()

    painting_items = []
    for row in rows:
        painting_items.append({
            "id": row["objectid"],
            "name": row["title"] or "Untitled",
            "desc": row["medium"] or "Unknown medium"
        })

    sections.append({
        "name": "Paintings",
        "items": painting_items
    })

    cur.execute("""
        SELECT objectid, title, medium
        FROM artworks
        WHERE classification = 'Photography'
        ORDER BY objectid
        LIMIT 4;
    """)
    rows = cur.fetchall()

    photo_items = []
    for row in rows:
        photo_items.append({
            "id": row["objectid"],
            "name": row["title"] or "Untitled",
            "desc": row["medium"] or "Unknown medium"
        })

    sections.append({
        "name": "Photography Collection",
        "items": photo_items
    })

    return sections


def get_news_items(cur):
    cur.execute("""
        SELECT id, name, sub
        FROM news_items
        ORDER BY id;
    """)
    rows = cur.fetchall()

    items = []
    for row in rows:
        items.append({
            "id": row["id"],
            "name": row["name"],
            "sub": row["sub"]
        })
    return items


@app.route("/home")
def home_data():
    conn = get_connection()
    cur = conn.cursor()

    data = {
        "forYouItems": get_for_you_items(cur),
        "exhibitSections": get_exhibit_sections(cur),
        "newsItems": get_news_items(cur)
    }

    cur.close()
    conn.close()

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)