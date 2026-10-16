# SPARK Orders client

A React + TypeScript web client for the SPARK Orders API: sign in, build a multi-line order, place it, and see the server's totals.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
npm test                 # unit tests
npm run build            # typecheck + production build
```

Create the salesperson account once in Postman (`POST /Users`); the app only signs users in.

## Styling

The CSS was generated using AI, based on the SPARK colours in the project document.
