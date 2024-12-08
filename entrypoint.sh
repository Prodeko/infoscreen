#!/bin/bash

# Run the scrape script immediately
echo "Running scrape script at startup..."
node /app/scrapePlaywright.js

# Start nginx
echo "Starting nginx..."
service nginx start

# Start cron in the foreground
echo "Starting cron..."
cron -f
