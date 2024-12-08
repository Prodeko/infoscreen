#!/bin/bash

# Run the scrape script immediately
echo "Running scrape script at startup..."
node /app/scrapePlaywright.js

# Start nginx
service nginx start
echo "Started nginx"

# Start cron in the foreground
cron -f
echo "Started cron"
