# Simple Hello World Cloudflare Container

A minimal "Hello World" application for Cloudflare Workers.

## Files

- `index.js` - Cloudflare Worker entry point
- `server.js` - Standalone Node.js server for local testing
- `Dockerfile` - Container configuration
- `wrangler.toml` - Cloudflare Workers configuration
- `package.json` - Node.js dependencies

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```

## Run Locally

### Option 1: Cloudflare Workers (recommended)
```bash
npm run dev
```

### Option 2: Standalone Node.js server
```bash
npm start
```

### Option 3: Docker container
```bash
docker build -t simplesurvey .
docker run -p 8080:8080 simplesurvey
```

Then visit http://localhost:8080

## Deploy to Cloudflare

```bash
npm run deploy
```

Your worker will be deployed to `https://simplesurvey.<your-subdomain>.workers.dev`

## What it does

Returns a simple "Hello World from Cloudflare Container!" message for all requests.
