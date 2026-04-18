# TigerArt

Super simple setup for local development.

As a one server system, the code needs to have the front end set up and run through the backend

## 1. Requirements - First Time Set Up

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
- dotenv
- msal

- ** Note: depending on python library downloaded, run all "python" commands as either "python3" or "python"

Can run:
```bash
pip install flask flask-cors psycopg2 requests cloudinary dotenv msal
```

- Git LFS (for large files)
```bash
sudo apt install git-lfs
git lfs install
git lfs track "*.json"
git lfs track "*.zip"
```

### Frontend Set Up

```bash
cd frontend
npm install
npm run builddev
```

### Backend Set Up
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

## Local Run
```bash
cd backend
python server.py
```
Keep the server running in the terminal
Open URL shown in terminal (localhost:5001)
