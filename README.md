# Sanchara Admin Dashboard

Minimal black & white admin UI for Sanchara, powered by React + Vite.

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure environment (optional)

Create `.env` and set base URL if needed (defaults to production API):

```bash
VITE_API_BASE_URL=https://sanchara-api1.sreecharandesu.in
```

3) Run dev server

```bash
npm run dev
```

## Admin Endpoints

Backed by Admin API documented in `backend/admin-readme.md` and live base URL `https://sanchara-api1.sreecharandesu.in`.

Key routes used:

- POST `/api/admin/bootstrap-super-admin`
- POST `/api/admin/signup`
- POST `/api/admin/signin`
- POST `/api/admin/create`
- GET `/api/admin/dashboard`

## Notes

- JWT is persisted in local storage via Zustand.
- UI is strictly black and white for maximal clarity.
