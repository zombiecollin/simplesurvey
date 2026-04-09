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
- 💾 **Stores results per device in D1 database**
- 🔐 **Unique device tracking with localStorage**
- 🔄 **Auto-saves progress on every Next button click**
- 📥 **Auto-loads previous responses when you return**
- ⚡ **Resume where you left off - never lose your progress!**

## Files

- `index.js` - Cloudflare Worker that serves the survey and handles D1 storage
- `public/index.html` - Survey web application (source)
- `public/results.html` - **Results dashboard with real-time updates**
- `migrations/0001_create_survey_responses.sql` - D1 database schema
- `server.js` - Node.js server for local testing
- `wrangler.toml` - Cloudflare Workers configuration
- `package.json` - Node.js dependencies
- `setup-d1.sh` - Script to create D1 database
- `FLOW.md` - Documentation of survey flow and data management

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

## View Results Dashboard

Access the real-time results dashboard at:
- **Local:** `http://localhost:8080/results`
- **Production:** `https://simplesurvey.<your-subdomain>.workers.dev/results`

### Dashboard Features:
- 📊 **Live analytics** -Real-time response statistics
- 🔄 **Auto-refresh** - Polls for new data every 10 seconds
- 📈 **Visual charts** - Progress bars showing answer distribution
- 📱 **Responsive design** - Works on all devices
- 🎯 **Completion tracking** - See how many users finished the survey

The dashboard automatically:
- Refreshes data every 10 seconds
- Pauses when tab is hidden (saves battery)
- Resumes when tab becomes visible again
- Shows total responses, unique devices, and completion rate

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

### Device Tracking & Auto-Save

Each device is assigned a unique ID stored in localStorage with automatic progress saving:

**On First Visit:**
1. A unique device ID is generated (format: `dev_timestamp_random`)
2. The ID is stored in localStorage for future visits

**As You Answer Questions:**
1. Every time you click "Next", your answer is immediately saved to D1
2. Progress is saved in real-time - no need to complete the entire survey
3. Responses are upserted (previous answers are replaced with new ones)

**When You Return:**
1. The app automatically loads your previous responses from D1
2. You can review or change your answers
3. Continue from where you left off

**This allows you to:**
- Never lose your progress - close the browser anytime
- Review and update answers before final submission
- Track responses per device
- Prevent accidental data loss
- Analyze response patterns and partial completions
- Build analytics dashboards

**Privacy Note:** All data is tied to a random device ID, not personal information.

## API Endpoints

The worker exposes three endpoints:

### `GET /api/responses?deviceId={id}`
Load previous responses for a device. Auto-called on page load.

**Response:**
```json
{
  "responses": [
    {
      "questionId": 0,
      "questionText": "What is your favorite type of music?",
      "answerIndex": 2,
      "answerText": "Jazz"
    }
  ]
}
```

### `POST /api/save`
Save progress after each Next button click. Upserts responses (replaces existing).

**Request:**
```json
{
  "deviceId": "dev_1234567890_abc123",
  "responses": [
    {
      "questionId": 0,
      "questionText": "What is your favorite type of music?",
      "answerIndex": 2,
      "answerText": "Jazz"
    }
  ]
}
```

### `POST /api/submit`
Submit final survey. Updates existing records by device_id and question_id without deleting previous entries.

**Request:**
```json
{
  "deviceId": "dev_1234567890_abc123",
  "responses": [
    {
      "questionId": 0,
      "questionText": "What is your favorite type of music?",
      "answerIndex": 2,
      "answerText": "Jazz"
    }
  ]
}
```

**Behavior:**
- Uses UPDATE statements to modify existing records
- Preserves the original `created_at` timestamp
- Only updates `answer_index` and `answer_text` fields

### `GET /api/results`
Fetch aggregated survey results with response statistics and answer distributions.

**Response:**
```json
{
  "stats": {
    "totalResponses": 15,
    "uniqueDevices": 3,
    "expectedResponses": 15
  },
  "questions": [
    {
      "questionId": 0,
      "questionText": "What is your favorite type of music?",
      "options": [
        { "answerText": "Rock", "count": 5 },
        { "answerText": "Jazz", "count": 7 },
        { "answerText": "Pop", "count": 3 }
      ]
    }
  ]
}
```

**Usage:**
- Powers the `/results` dashboard
- Auto-refreshes every 10 seconds on the dashboard
- No authentication required (public analytics)
