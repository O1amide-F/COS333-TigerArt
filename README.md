# TigerArt (Frontend + Simple Backend)

Super simple setup for local development.

Backend is optional right now. The frontend works by itself.

## 1. Requirements

- Node.js 18+
- npm
- PostgreSQL
- Git LFS (for large files)

- Install Git LFS: https://git-lfs.github.com/

Then run: git lfs install


```bash
git clone https://github.com/O1amide-F/COS333-TigerArt
```

## 2. Run Frontend

```bash
cd frontend
npm install
npm run dev

```

Open the URL shown in terminal.

## Frontend Only (Quickest)

If you only want the UI, this is enough:

```bash
cd frontend
npm install (only the first time)
npm run dev
```

## 3. Run Backend

Each person must create the same local database:

createdb museum_app

Create tables: python create_tables.py

Load data (if applicable): python load_data.py

Make sure your DB credentials in the code match your local setup: -
DB_NAME = museum_app - DB_USER = your postgres user - DB_PASSWORD = your
password

Backend runs on http://localhost:4000 by default.

## 4. Test Backend Quickly

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/survey
```

## 5. Build Frontend for Production

```bash
cd frontend
npm run build
```
