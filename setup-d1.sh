#!/bin/bash

echo "🔧 Setting up D1 database for Simple Survey..."
echo ""

# Create D1 database
echo "Creating D1 database..."
wrangler d1 create survey-db

echo ""
echo "⚠️  IMPORTANT: Copy the database_id from above and update wrangler.toml"
echo ""
echo "Then run the migration with:"
echo "  wrangler d1 execute survey-db --local --file=./migrations/0001_create_survey_responses.sql"
echo "  wrangler d1 execute survey-db --remote --file=./migrations/0001_create_survey_responses.sql"
echo ""
