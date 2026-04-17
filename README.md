# TigerArt (Frontend + Simple Backend)

Super simple setup for local development.

Backend is optional right now. The frontend works by itself.

## 1. Requirements

```bash
git clone https://github.com/O1amide-F/COS333-TigerArt
```

### Necessary Libraries
- Node.js 18+
- npm
- PostgreSQL
- flask
- flask-cors
- psycopg2
- requests
- cloudinary

- ** Note: depending on python library downloaded, run all "python" commands as either "python3" or "python"

Can run:
```bash
pip install flask flask-cors psycopg2 requests cloudinary
```

- Git LFS (for large files)
```bash
sudo apt install git-lfs
git lfs install
git lfs track "*.json"
git lfs track "*.zip"
```


## 2. Run Backend
If first time set up is complete:
```bash
cd backend
python3 server.py
```
Keep the server running in the terminal
Open URL shown in terminal (localhost:5001)

### First time set up
Each person must create the same local database:

```bash
createdb tigerart_db
python3 setup_museum_db.py
python3 populate_db.py
python3 cloudinary_imgs_to_db.py
```

Make sure your DB credentials in the code match your local setup: -
DB_NAME = museum_app - DB_USER = your postgres user - DB_PASSWORD = your
password

- If your PostgreSQL password is different, run 
```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'cos333';"
```


## 3. Run Frontend

```bash
cd frontend
npm install (only the first time)
npm run builddev
```

