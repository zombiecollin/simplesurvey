# Simple Survey Application

A single-page survey application that asks single-selection questions one at a time.

**Now runs as a Cloudflare Worker with D1 Database Storage! ☁️**

## Features

- 📋 One question at a time interface
- 🎨 Beautiful gradient design
- 📊 Progress bar tracking
- ✅ Single-choice selection
- 🔙 Navigate back and forth between questions
- 📄 Summary of all responses at the end
- ☁️ Runs on Cloudflare's edge network
- 💾 **NEW: Stores results per device in D1 database**
- 🔐 **NEW: Unique device tracking with localStorage**

## Files

- `index.js` - Cloudflare Worker that serves the survey and handles D1 storage
- `migrations/0001_create_survey_responses.sql` - D1 database schema
- `public/index.html` - Survey web application (source)
- `server.js` - Node.js server for local testing
- `wrangler.toml` - Cloudflare Workers configuration
- `package.json` - Node.js dependencies
- `setup-d1.sh` - Script to create D1 database

## Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Create D1 Database:

**Step 1:** Create the database
```bash
npx wrangler d1 create survey-db
```

**Step 2:** Copy the `database_id` from the output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "survey-db"
database_id = "your-database-id-here"  # Replace with actual ID
```

**Step 3:** Run migrations
```bash
# For local development
npx wrangler d1 execute survey-db --local --file=./migrations/0001_create_survey_responses.sql

# For production
npx wrangler d1 execute survey-db --remote --file=./migrations/0001_create_survey_responses.sql
```

## Run Locally

### Option 1: Cloudflare Workers Dev (Recommended)
```bash
npm run dev
```

### Option 2: Node.js Server
```bash
npm start
```

Then open your browser and visit **http://localhost:8080**

## Deploy to Cloudflare

**Prerequisites:** Make sure you've created the D1 database and run the remote migration (see Setup step 2).

1. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

Your survey will be live at `https://simplesurvey.<your-subdomain>.workers.dev`

## Database Schema

The D1 database stores survey responses with the following structure:

```sql
survey_responses (
  id              INTEGER PRIMARY KEY,
  device_id       TEXT NOT NULL,
  question_id     INTEGER NOT NULL,
  question_text   TEXT NOT NULL,
  answer_index    INTEGER NOT NULL,
  answer_text     TEXT NOT NULL,
  created_at      DATETIME
)
```

## Query Survey Data

View stored responses:
```bash
# Local database
npx wrangler d1 execute survey-db --local --command "SELECT * FROM survey_responses"

# Production database
npx wrangler d1 execute survey-db --remote --command "SELECT * FROM survey_responses"
```

Get response counts by question:
```bash
npx wrangler d1 execute survey-db --remote --command "SELECT question_text, answer_text, COUNT(*) as count FROM survey_responses GROUP BY question_text, answer_text"
```

## Customize Survey Questions

Edit the `questions` array in [index.js](index.js) to customize your survey:

```javascript
const questions = [
    {
        question: "Your question here?",
        options: ["Option 1", "Option 2", "Option 3"]
    },
    // Add more questions...
];
```

After editing, redeploy with `npm run deploy` or restart the dev server.

## What's Included

The survey includes 5 sample questions about:
- Music preferences
- Exercise habits  
- Relaxation methods
- Communication preferences
- Vacation styles

### Device Tracking

Each device is assigned a unique ID stored in localStorage. When a user completes the survey:
1. A unique device ID is generated (format: `dev_timestamp_random`)
2. All responses are saved to D1 with this device ID
3. The device ID persists across page reloads
4. Responses are stored individually but can be queried by device

This allows you to:
- Track responses per device
- Prevent duplicate submissions (if desired)
- Analyze response patterns
- Build analytics dashboards
```

Your worker will be deployed to `https://simplesurvey.<your-subdomain>.workers.dev`

## What it does

Returns a simple "Hello World from Cloudflare Container!" message for all requests.
