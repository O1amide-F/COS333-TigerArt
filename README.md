# TigerArt (Frontend + Simple Backend)

Super simple setup for local development.

Backend is optional right now. The frontend works by itself.

## 1. Requirements

- Node.js 18+
- npm

```bash
git clone https://github.com/O1amide-F/COS333-TigerArt
```

## 2. Run Frontend

```bash
cd tigerArt
npm install
npm run dev
```

Open the URL shown in terminal.

## Frontend Only (Quickest)

If you only want the UI, this is enough:

```bash
cd tigerArt
npm install (only the first time)
npm run dev
```

## 3. Run Backend

(Optional)

Open a second terminal from the project root:

```bash
cd ..
node backend/backend.js
```

Backend runs on http://localhost:4000 by default.

## 4. Test Backend Quickly

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/survey
```

## 5. Build Frontend for Production

```bash
cd tigerArt
npm run build
```
