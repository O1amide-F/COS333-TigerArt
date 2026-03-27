from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2

DB_NAME = "museum_app"
DB_USER = "postgres"
DB_PASSWORD = "cos333"
DB_HOST = "localhost"
DB_PORT = "5432"

CLOUD_NAME = "dfftqt3zi"

app = Flask(__name__)
CORS(app)


def get_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


@app.route("/api/for-you")
def get_for_you():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            a.objectid AS id,
            a.title AS title,
            CONCAT_WS(' - ', a.medium, a.displaydate, a.displaymaker) AS about
        FROM recommendation_cache rc
        JOIN artworks a
            ON rc.objectid = a.objectid
        ORDER BY rc.score DESC;
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    items = []
    for row in rows:
        items.append({
            "id": row[0],
            "title": row[1],
            "about": row[2]
        })

    return jsonify(items)


@app.route("/api/news")
def get_news():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, sub
        FROM news_items
        ORDER BY id;
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    news = []
    for row in rows:
        news.append({
            "id": row[0],
            "name": row[1],
            "sub": row[2]
        })

    return jsonify(news)


@app.route("/api/exhibits")
def get_exhibits():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            objectid,
            title,
            medium,
            department
        FROM artworks
        WHERE department IS NOT NULL
        ORDER BY department, title
        LIMIT 40;
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    sections_dict = {}

    for row in rows:
        objectid = row[0]
        title = row[1]
        medium = row[2]
        department = row[3]

        image_url = f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload/artworks/{objectid}.jpg"

        if department not in sections_dict:
            sections_dict[department] = []

        sections_dict[department].append({
            "id": objectid,
            "name": title,
            "desc": medium,
            "image_url": image_url
        })

    sections = []
    for department, items in sections_dict.items():
        sections.append({
            "name": department,
            "items": items
        })

    return jsonify(sections)


if __name__ == "__main__":
    app.run(debug=True, port=5001)