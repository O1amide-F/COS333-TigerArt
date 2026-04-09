from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import json
import re
import os

DB_NAME = os.getenv("DB_NAME", "tigerart_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "cos333")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
CLOUD_NAME = "dc4nhrcsm"

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Feature vector layout (21 dimensions, in this exact order)
# ---------------------------------------------------------------------------
FEATURE_DIMS = [
    # daterange (6)
    "ancient", "medieval", "early_modern", "19th_century", "early_20th", "modern",
    # classification (8)
    "painting", "sculpture", "drawing", "print", "photography",
    "textile", "decorative", "artifact",
    # geography (7)
    "european", "asian", "african_oceanic", "american",
    "ancient_americas", "ancient_mediterranean_islamic", "modern_global",
]
DIM_INDEX = {dim: i for i, dim in enumerate(FEATURE_DIMS)}
N_DIMS = len(FEATURE_DIMS)  # 21


# ---------------------------------------------------------------------------
# Mapping helpers
# ---------------------------------------------------------------------------

def parse_era(displaydate: str) -> str | None:
    """
    Extract the most representative year from a displaydate string and
    map it to one of the six era tags.

    Handles the formats actually found in the PUAM dataset:
      - "18th century", "19th century", "early 20th century"
      - "mid 19th-mid 20th century", "late 19th-early 20th century"
      - "early 7th century BCE", "3rd century BCE", "ca. 580 BCE"
      - "1977", "ca. 1880", "1850-1900", "1938, printed 1980s"
      - "1960s", "1980s"
      - "before 1885", "before 1914"
    """
    if not displaydate:
        return None

    text = displaydate.strip()

    # --- BC / BCE → always ancient ---
    if re.search(r'\bB\.?C\.?(E\.?)?\b', text, re.IGNORECASE):
        return "ancient"

    # --- Named-century patterns (must come before generic digit extraction) ---
    # Maps written century numbers to approximate midpoint years.
    # Handles qualifiers: "early", "mid", "late" shift the midpoint.
    # We collect all century references in the string and average them,
    # which handles ranges like "mid 19th–early 20th century".

    CENTURY_WORD = {
        "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5,
        "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9, "tenth": 10,
        "eleventh": 11, "twelfth": 12, "thirteenth": 13, "fourteenth": 14,
        "fifteenth": 15, "sixteenth": 16, "seventeenth": 17,
        "eighteenth": 18, "nineteenth": 19, "twentieth": 20,
        "twenty-first": 21,
    }

    QUALIFIER_OFFSET = {"early": -25, "mid": 0, "late": 25}

    def _century_to_year(qualifier: str | None, n: int) -> int:
        base = (n - 1) * 100 + 50
        offset = QUALIFIER_OFFSET.get(qualifier.lower(), 0) if qualifier else 0
        return base + offset

    century_years = []

    # "early/mid/late Nth century" (numeric ordinal)
    for m in re.finditer(
        r'\b(early|mid|late)?\s*(\d{1,2})(st|nd|rd|th)\s+century',
        text, re.IGNORECASE
    ):
        qualifier, n = m.group(1), int(m.group(2))
        century_years.append(_century_to_year(qualifier, n))

    # "early/mid/late [written ordinal] century" e.g. "nineteenth century"
    word_pattern = '|'.join(CENTURY_WORD.keys())
    for m in re.finditer(
        rf'\b(early|mid|late)?\s*({word_pattern})\s+century',
        text, re.IGNORECASE
    ):
        qualifier = m.group(1)
        n = CENTURY_WORD[m.group(2).lower()]
        century_years.append(_century_to_year(qualifier, n))

    if century_years:
        return _year_to_era(round(sum(century_years) / len(century_years)))

    # --- Decade strings: "1960s", "1980s" ---
    decade_matches = re.findall(r'\b(1\d{2}0)s\b', text)
    if decade_matches:
        avg = round(sum(int(d) + 5 for d in decade_matches) / len(decade_matches))
        return _year_to_era(avg)

    # --- Plain 4-digit years (handles "ca. 1880", "1850-1900", "1938, printed 1985") ---
    years = [int(y) for y in re.findall(r'\b(1\d{3}|20\d{2})\b', text)]
    if years:
        return _year_to_era(round(sum(years) / len(years)))

    # --- Short AD years e.g. "850 AD", "1st century CE" already caught above ---
    short_years = [int(y) for y in re.findall(r'\b([1-9]\d{1,2})\b', text)]
    if short_years:
        return _year_to_era(round(sum(short_years) / len(short_years)))

    return None


def _year_to_era(year: int) -> str:
    if year < 500:
        return "ancient"
    if year < 1500:
        return "medieval"
    if year < 1800:
        return "early_modern"
    if year < 1900:
        return "19th_century"
    if year < 1945:
        return "early_20th"
    return "modern"


# Raw classification → cleaned tag
CLASSIFICATION_MAP = {
    "paintings":        "painting",
    "painting":         "painting",
    "sculpture":        "sculpture",
    "drawings":         "drawing",
    "drawing":          "drawing",
    "prints":           "print",
    "print":            "print",
    "photographs":      "photography",
    "photography":      "photography",
    "textiles":         "textile",
    "textile":          "textile",
    "masks":            "artifact",
    "ceramic":          "decorative",
    "ceramics":         "decorative",
    "metal":            "decorative",
    "ivories":          "artifact",
    "faience":          "artifact",
    "glass":            "decorative",
    "weapons and armor":"artifact",
    "bone":             "artifact",
    "time-based works": "artifact",
}

# Raw department → cleaned geography tag
DEPARTMENT_MAP = {
    "prints and drawings":               "european",
    "european painting and sculpture":   "european",
    "asian art":                         "asian",
    "photography":                       "modern_global",
    "photography archives":              "modern_global",
    "african and oceanic art":           "african_oceanic",
    "ancient, byzantine, and islamic art": "ancient_mediterranean_islamic",
    "american art":                      "american",
    "modern and contemporary art":       "modern_global",
    "art of the ancient americas":       "ancient_americas",
}


def tag_object(objectid, classification, department, displaydate) -> list[float]:
    """
    Build a 21-dim binary feature vector for a single artwork.
    Multiple 1s are allowed (multi-hot encoding).
    """
    vec = [0.0] * N_DIMS

    # Era
    era = parse_era(displaydate)
    if era and era in DIM_INDEX:
        vec[DIM_INDEX[era]] = 1.0

    # Classification
    clf_key = (classification or "").strip().lower()
    clf_tag = CLASSIFICATION_MAP.get(clf_key)
    if clf_tag:
        vec[DIM_INDEX[clf_tag]] = 1.0

    # Geography
    dept_key = (department or "").strip().lower()
    geo_tag = DEPARTMENT_MAP.get(dept_key)
    if geo_tag:
        vec[DIM_INDEX[geo_tag]] = 1.0

    return vec


# ---------------------------------------------------------------------------
# Survey configuration
# ---------------------------------------------------------------------------
# Each question lists the tag dimension that the nth image represents.
# The frontend must display images in this exact order for the mapping to work.
# Use GET /api/survey/config to let the frontend know which objectid maps to
# which tag slot — see below.

SURVEY_QUESTIONS = [
    {
        "id": "era",
        "prompt": "Which of these artworks speak to you?",
        "tags": ["ancient", "medieval", "early_modern", "19th_century", "early_20th", "modern"],
    },
    {
        "id": "classification",
        "prompt": "What kinds of art do you enjoy most?",
        "tags": ["painting", "sculpture", "drawing", "print", "photography", "textile", "decorative", "artifact"],
    },
    {
        "id": "geography",
        "prompt": "Which cultural traditions interest you?",
        "tags": ["european", "asian", "african_oceanic", "american", "ancient_americas", "ancient_mediterranean_islamic", "modern_global"],
    },
]


def build_user_vector(survey_answers: dict) -> list[float]:
    """
    survey_answers: {
        "era":            ["early_20th", "modern", "medieval"],
        "classification": ["painting", "photography", "sculpture"],
        "geography":      ["asian", "european", "modern_global"]
    }
    Each list contains exactly 3 selected tag names.
    Each selected tag gets 1/3 ≈ 0.333; unselected tags stay 0.
    """
    vec = [0.0] * N_DIMS
    weight = 1.0 / 3.0

    for question in SURVEY_QUESTIONS:
        qid = question["id"]
        selected_tags = survey_answers.get(qid, [])
        for tag in selected_tags:
            if tag in DIM_INDEX:
                vec[DIM_INDEX[tag]] = weight

    return vec


def dot_product(u: list[float], v: list[float]) -> float:
    return sum(a * b for a, b in zip(u, v))


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

def get_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


def save_user_vector(cur, user_id: int, vector: list[float]):
    """
    Upsert the feature vector into user_preferences.
    preference_type = 'feature_vector'
    preference_value = JSON array string
    """
    cur.execute("""
        INSERT INTO user_preferences (user_id, preference_type, preference_value)
        VALUES (%s, 'feature_vector', %s)
        ON CONFLICT (user_id, preference_type)
        DO UPDATE SET preference_value = EXCLUDED.preference_value;
    """, (user_id, json.dumps(vector)))


def load_user_vector(cur, user_id: int) -> list[float] | None:
    cur.execute("""
        SELECT preference_value FROM user_preferences
        WHERE user_id = %s AND preference_type = 'feature_vector';
    """, (user_id,))
    row = cur.fetchone()
    if row is None:
        return None
    return json.loads(row[0])


# ---------------------------------------------------------------------------
# Existing endpoints (unchanged-ish)
# ---------------------------------------------------------------------------

@app.route("/api/for-you")
def get_for_you():
    """Original non-personalised feed (kept for backwards compatibility)."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            a.objectid AS id,
            a.title,
            CONCAT_WS(' - ', a.medium, a.displaydate, a.displaymaker) AS about,
                ai.image_url,
                a.department,
                a.classification,
                a.displaydate,
                a.displaymaker,
                a.on_view
        FROM artworks a
        LEFT JOIN artwork_images ai
        ON a.objectid = ai.objectid
        WHERE a.title IS NOT NULL
        LIMIT 20;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    items = []
    for row in rows:
        items.append({
            "id": row[0],
            "title": row[1],
            "about": row[2],
            "imageUrl": row[3],
            "department": row[4],
            "classification": row[5],
            "displaydate": row[6],
            "displaymaker": row[7],
            "on_view": row[8],
        })

    return jsonify(items)


@app.route("/api/news")
def get_news():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, name, sub FROM news_items ORDER BY id;")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{"id": r[0], "name": r[1], "sub": r[2]} for r in rows])


@app.route("/api/exhibits")
def get_exhibits():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        WITH ranked_artworks AS (
            SELECT DISTINCT ON (a.objectid)
                a.objectid,
                a.title,
                a.medium,
                a.department,
                a.classification,
                a.displaydate,
                a.displaymaker,
                a.on_view,
                ai.image_url,
                ROW_NUMBER() OVER (
                    PARTITION BY a.department
                    ORDER BY a.title
                ) AS rn
            FROM artworks a
            LEFT JOIN artwork_images ai
                ON a.objectid = ai.objectid
            WHERE a.department IS NOT NULL
              AND TRIM(a.department) <> ''
              AND a.department <> '(not assigned)'
        )
        SELECT objectid, title, medium, department, classification,
               displaydate, displaymaker, on_view, image_url
        FROM ranked_artworks
        WHERE rn <= 10
        ORDER BY department, rn
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    sections_dict = {}
    for row in rows:
        dept = row[3]
        if dept not in sections_dict:
            sections_dict[dept] = []
        sections_dict[dept].append({
            "id":           row[0],
            "name":         row[1],
            "desc":         row[2],
            "department":   row[3],
            "classification": row[4],
            "displaydate":  row[5],
            "displaymaker": row[6],
            "on_view":      row[7],
            "imageUrl":     row[8],
        })

    return jsonify([{"name": k, "items": v} for k, v in sections_dict.items()])


# ---------------------------------------------------------------------------
# New endpoints
# ---------------------------------------------------------------------------

@app.route("/api/survey/config")
def get_survey_config():
    """
    Returns the survey question structure so the frontend knows which
    objectids to display and which tag each image slot represents.

    You must pre-select one representative artwork per tag and store their
    objectids in the SURVEY_IMAGE_MAP below. Update that map with real
    objectids from your database.
    """
    # -----------------------------------------------------------------------
    # TODO: replace these placeholder objectids with real ones from your DB.
    # Pick one visually representative artwork per tag.
    # -----------------------------------------------------------------------
    SURVEY_IMAGE_MAP = {
        # era
        "ancient":       54820,
        "medieval":      23720,
        "early_modern":  20210,
        "19th_century":  31041,
        "early_20th":    31750,
        "modern":        126616,
        # classification
        "painting":      32953,
        "sculpture":     23270,
        "drawing":       61125,
        "print":         55271,
        "photography":   51181,
        "textile":       135667,
        "decorative":    31728,
        "artifact":      93317,
        # geography
        "european":                      8176,
        "asian":                         93322,
        "african_oceanic":               36735,
        "american":                      138651,
        "ancient_americas":              62610,
        "ancient_mediterranean_islamic": 43495,
        "modern_global":                 142482,
    }

    # Fetch image URLs for the mapped objectids (skip Nones)
    objectids = [oid for oid in SURVEY_IMAGE_MAP.values() if oid is not None]
    image_lookup = {}

    if objectids:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT objectid, image_url FROM artwork_images WHERE objectid = ANY(%s);",
            (objectids,)
        )
        for row in cur.fetchall():
            image_lookup[row[0]] = row[1]
        cur.close()
        conn.close()

    questions = []
    for q in SURVEY_QUESTIONS:
        options = []
        for tag in q["tags"]:
            oid = SURVEY_IMAGE_MAP.get(tag)
            options.append({
                "tag": tag,
                "objectid": oid,
                "imageUrl": image_lookup.get(oid) if oid else None,
            })
        questions.append({
            "id": q["id"],
            "prompt": q["prompt"],
            "options": options,
            "selectCount": 3,
        })

    return jsonify({"questions": questions, "dims": FEATURE_DIMS})


@app.route("/api/survey/submit", methods=["POST"])
def submit_survey():
    """
    Accepts survey answers, builds the user feature vector, and saves it.

    Expected JSON body:
    {
        "userId": 42,
        "answers": {
            "era":            ["early_20th", "modern", "medieval"],
            "classification": ["painting", "photography", "sculpture"],
            "geography":      ["asian", "european", "modern_global"]
        }
    }
    """
    body = request.get_json(force=True)
    user_id = body.get("userId")
    answers = body.get("answers", {})

    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    # Validate: each question must have exactly 3 selections
    for q in SURVEY_QUESTIONS:
        qid = q["id"]
        selected = answers.get(qid, [])
        if len(selected) != 3:
            return jsonify({
                "error": f"Question '{qid}' requires exactly 3 selections, got {len(selected)}"
            }), 400
        valid_tags = set(q["tags"])
        for tag in selected:
            if tag not in valid_tags:
                return jsonify({"error": f"Invalid tag '{tag}' for question '{qid}'"}), 400

    user_vector = build_user_vector(answers)

    conn = get_connection()
    cur = conn.cursor()
    save_user_vector(cur, user_id, user_vector)
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"success": True, "vector": user_vector, "dims": FEATURE_DIMS})


@app.route("/api/for-you/<int:user_id>")
def get_for_you_personalised(user_id):
    """
    Personalised feed: dot-product the user vector against all object
    vectors and return the top 10 artworks.
    """
    conn = get_connection()
    cur = conn.cursor()

    # Load user vector
    user_vec = load_user_vector(cur, user_id)
    if user_vec is None:
        cur.close()
        conn.close()
        return jsonify({"error": "No survey data found for this user. Please complete the survey."}), 404

    # Load all artworks with the fields needed for tagging
    cur.execute("""
        SELECT
            a.objectid,
            a.title,
            CONCAT_WS(' - ', a.medium, a.displaydate, a.displaymaker) AS about,
            ai.image_url,
            a.classification,
            a.department,
            a.displaydate,
            a.displaymaker,
            a.on_view
        FROM artworks a
        LEFT JOIN artwork_images ai ON a.objectid = ai.objectid
        WHERE a.title IS NOT NULL;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Score each artwork
    scored = []
    for row in rows:
        objectid, title, about, image_url, classification, department, displaydate, displaymaker, on_view = row
        obj_vec = tag_object(objectid, classification, department, displaydate)
        score = dot_product(user_vec, obj_vec)
        scored.append((score, {
            "id": objectid,
            "title": title,
            "about": about,
            "imageUrl": image_url,
            "score": round(score, 4),
            "department": department,
            "classification": classification,
            "displaydate": displaydate,
            "displaymaker": displaymaker,
            "on_view": on_view,
        }))

    # Return top 10
    scored.sort(key=lambda x: x[0], reverse=True)
    top10 = [item for _, item in scored[:10]]

    return jsonify(top10)

@app.route("/api/search")
def search():
    """
    Search artworks by title keyword and/or tag.
    GET /api/search?q=<query>
    Returns up to 30 results ranked: tag matches (x2 weight) then keyword matches.
    """
    q = (request.args.get("q") or "").strip().lower()
    if not q:
        return jsonify([])

    tokens = set(re.split(r"[\s,]+", q))

    SYNONYM_MAP = {
        "old": "ancient", "antique": "ancient", "classical": "ancient",
        "byzantine": "ancient_mediterranean_islamic",
        "islamic": "ancient_mediterranean_islamic",
        "renaissance": "early_modern", "baroque": "early_modern",
        "victorian": "19th_century",
        "contemporary": "modern", "recent": "modern",
        "paintings": "painting", "painted": "painting",
        "sculptures": "sculpture", "statue": "sculpture", "statues": "sculpture",
        "drawings": "drawing", "sketch": "drawing", "sketches": "drawing",
        "prints": "print", "etching": "print", "lithograph": "print",
        "photos": "photography", "photo": "photography",
        "photograph": "photography", "photographs": "photography",
        "textiles": "textile", "fabric": "textile", "weaving": "textile",
        "cloth": "textile", "tapestry": "textile",
        "ceramics": "decorative", "ceramic": "decorative", "pottery": "decorative",
        "glass": "decorative", "vessel": "decorative",
        "mask": "artifact", "masks": "artifact", "weapon": "artifact",
        "weapons": "artifact", "ivory": "artifact",
        "europe": "european", "french": "european", "italian": "european",
        "dutch": "european", "german": "european", "british": "european",
        "english": "european", "spanish": "european",
        "asia": "asian", "chinese": "asian", "japanese": "asian",
        "korean": "asian", "indian": "asian",
        "africa": "african_oceanic", "african": "african_oceanic",
        "oceanic": "african_oceanic",
        "america": "american", "usa": "american",
        "americas": "ancient_americas", "mayan": "ancient_americas",
        "aztec": "ancient_americas", "inca": "ancient_americas",
        "greek": "ancient_mediterranean_islamic",
        "roman": "ancient_mediterranean_islamic",
        "egyptian": "ancient_mediterranean_islamic",
        "global": "modern_global",
    }

    matched_tags = set()
    for token in tokens:
        if token in DIM_INDEX:
            matched_tags.add(token)
        elif token in SYNONYM_MAP:
            matched_tags.add(SYNONYM_MAP[token])

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            a.objectid,
            a.title,
            CONCAT_WS(' - ', a.medium, a.displaydate, a.displaymaker) AS about,
            ai.image_url,
            a.classification,
            a.department,
            a.displaydate
        FROM artworks a
        LEFT JOIN artwork_images ai ON a.objectid = ai.objectid
        WHERE a.title IS NOT NULL;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    results = []
    for row in rows:
        objectid, title, about, image_url, classification, department, displaydate = row
        title_lower = (title or "").lower()
        about_lower = (about or "").lower()
        obj_vec = tag_object(objectid, classification, department, displaydate)

        tag_score = sum(
            obj_vec[DIM_INDEX[tag]]
            for tag in matched_tags
            if tag in DIM_INDEX
        )
        keyword_score = sum(
            1 for token in tokens
            if token in title_lower or token in about_lower
        )

        total_score = (tag_score * 2) + keyword_score
        if total_score > 0:
            results.append((total_score, {
                "id": objectid,
                "title": title,
                "about": about,
                "imageUrl": image_url,
                "score": round(total_score, 4),
            }))

    results.sort(key=lambda x: x[0], reverse=True)
    return jsonify([item for _, item in results[:30]])

## Changed to also run on phone using ip address
if __name__ == "__main__":
    app.run(debug=True, port=5001, host='0.0.0.0')
