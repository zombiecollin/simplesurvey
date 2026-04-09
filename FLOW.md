# Survey Flow Documentation

## How It Works

### 1. Initial Page Load
```
User visits survey → Browser generates/loads device ID from localStorage
                   ↓
                   Fetch /api/responses?deviceId=xxx
                   ↓
                   Load previous responses (if any)
                   ↓
                   Render first question with pre-selected answers
```

### 2. Answering Questions
```
User selects an answer → Answer stored in memory (answers[currentQuestion])
                       ↓
                       UI updates to show selection
```

### 3. Clicking Next Button
```
User clicks Next → saveProgress() called
                 ↓
                 POST /api/save with current answers
                 ↓
                 Worker deletes old responses for this device
                 ↓
                 Worker inserts new responses
                 ↓
                 Move to next question
```

### 4. Clicking Back Button
```
User clicks Back → currentQuestion decreased
                 ↓
                 Render previous question with already-selected answer
                 ↓
                 No API call (answers still in memory)
```

### 5. Final Submission
```
User clicks Submit → submitSurvey() called
                   ↓
                   POST /api/submit with all answers
                   ↓
                   Worker updates existing records (preserves created_at)
                   ↓
                   Show results page
```

### 6. Returning Later
```
User returns to site → Same device ID from localStorage
                     ↓
                     Fetch /api/responses?deviceId=xxx
                     ↓
                     Load all previous responses
                     ↓
                     Pre-populate answers in memory
                     ↓
                     Render questions with selections intact
```

## Data Flow

### Frontend (JavaScript)
- `deviceId`: Generated once, stored in localStorage
- `answers`: Object mapping question index to selected answer index
- `currentQuestion`: Current question being displayed
- Auto-saves on every Next click
- Auto-loads on page load

### Backend (Cloudflare Worker)
- Receives device ID with every request
- Uses D1 for persistent storage
- `/api/save` pattern: DELETE + INSERT to replace all responses (upsert)
- `/api/submit` pattern: UPDATE existing records by device_id + question_id
- No duplicate responses per device

### Database (D1)
```sql
survey_responses
├── id (auto)
├── device_id (indexed)
├── question_id
├── question_text
├── answer_index
├── answer_text
└── created_at (auto)
```

## Example Scenario

**Day 1 - User starts survey:**
1. Answers questions 1-3
2. Each Next click saves to D1
3. User closes browser

**Day 2 - User returns:**
1. Page loads
2. Fetches responses for same device ID
3. Questions 1-3 show previous selections
4. User continues from question 4
5. Completes survey

**Day 3 - User changes mind:**
1. Page loads with all previous answers
2. User goes back and changes answer to question 2
3. Clicks Next - saves updated answer
4. Old answer is replaced in D1
5. Final submission has updated responses only

## Benefits

1. **Never lose progress** - Every answer is saved immediately
2. **Resumable** - Can close browser and return anytime
3. **Editable** - Can change answers before final submission
4. **No server state** - Everything based on device ID
5. **Fast** - Reads from D1 on load, writes on Next
6. **Simple** - No complex state management
7. **Preserves timestamps** - Final submission updates records without changing created_at

## Privacy & Storage

- Device ID is random, not tied to user identity
- Stored in browser's localStorage
- Responses stored in D1 by device ID
- No personal information required
- User can clear localStorage to reset identity
