#!/bin/bash

# Run scrape.js initially
node /app/scrape.js

# Start cron in the background
cron

# Start Nginx in the foreground
nginx -g "daemon off;"