# salgadostudio

Mobile-first website for **Paula Salgado Studio - Architect of Personal Power** using Node.js + Express + Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` Home page
- `/booking` Multi-step Personal Blueprint questionnaire
- `/admin` Owner login and submission dashboard

## Build production CSS

```bash
npm run build:css
```

## Admin access

1. Copy `.env.example` to `.env`.
2. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`.
3. Restart the server.

## Submissions

Booking submissions are stored for admin review in `data/submissions.json`.
