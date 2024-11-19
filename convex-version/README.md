# Roundest (Convex edition)

## Setup

Prerequisites: npm, node

1. Install deps:

```bash
npm install
```

2. Provision your Convex project:

```bash
npx convex dev
```

(Leave this running in the background to sync backend code.)

3. Run the frontend:

```bash
npm run dev
```

App is up on [localhost:3000](http://localhost:3000).

## Initializating the database

1. Go to the Convex dashboard

```bash
npx convex dashboard
```

2. Pop up the functions runner (labled `Fn`).

3. Run the `pokemon:initDatabase` function.
