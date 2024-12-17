#!/bin/bash

# Build the Next.js app
echo "🏗️ Building Next.js app..."
npm run build

# Deploy the worker
echo "🚀 Deploying worker..."
npx wrangler deploy public/_worker.js

# Get list of changed files
CHANGED_FILES=$(git status --porcelain | grep -E "^.M" | awk '{print $2}')

if [ -n "$CHANGED_FILES" ]; then
    echo "📦 Changed files:"
    echo "$CHANGED_FILES"
    
    # Upload changed files to R2
    for file in $CHANGED_FILES; do
        if [[ $file == .next/* ]] || [[ $file == public/* ]]; then
            echo "📤 Uploading $file..."
            npx wrangler r2 object put rtsda-web-assets "$file" --file "./$file"
        fi
    done
else
    echo "✨ No files changed"
fi

echo "✅ Deployment complete!"
