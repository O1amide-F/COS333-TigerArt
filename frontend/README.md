# TigerArt (Frontend + Simple Backend)

Super simple setup for local development.

Backend is optional right now. The frontend works by itself.

## 1. Requirements

- Node.js 18+
- npm

## 2. Run Frontend

```bash
cd tigerArt
npm install
npm run builddev
```

## Frontend Only (Quickest)

If you only want the UI, this is enough:

```bash
cd tigerArt
npm install
npm run dev
```

## 3. Run Backend

(Optional)

Open a second terminal from the project root:

```bash
cd ..
node backend/backend.js
```

Backend runs on http://localhost:5001 by default.

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
