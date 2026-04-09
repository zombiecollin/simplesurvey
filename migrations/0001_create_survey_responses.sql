-- Migration: Create survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_index INTEGER NOT NULL,
  answer_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by device
CREATE INDEX IF NOT EXISTS idx_device_id ON survey_responses(device_id);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_created_at ON survey_responses(created_at);
