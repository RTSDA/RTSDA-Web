#!/bin/bash

# Update all HTML files to use the head template
for file in *.html; do
    if [ "$file" != "styles.html" ]; then
        # Extract everything between <head> and </head>
        head_content=$(sed -n '/<head>/,/<\/head>/p' "$file")
        
        # Extract title
        title=$(echo "$head_content" | grep -o '<title>.*</title>' | sed 's/<title>\(.*\)<\/title>/\1/')
        
        # Extract description
        description=$(echo "$head_content" | grep -o '<meta name="description" content="[^"]*"' | sed 's/.*content="\([^"]*\)".*/\1/')
        
        # Replace the entire head section with our template
        sed -i '' '/<head>/,/<\/head>/c\
<head>\
    <!--- basic page needs\
    ==================================================-->\
    <meta charset="utf-8">\
    <title>'"$title"'</title>\
    <meta name="description" content="'"$description"'">\
    <meta name="author" content="">\
\
    <!-- mobile specific metas\
    ==================================================-->\
    <meta name="viewport" content="width=device-width, initial-scale=1">\
\
    <!-- CSS\
    ==================================================-->\
    <link rel="stylesheet" href="css/base.css">\
    <link rel="stylesheet" href="css/main.css">\
\
    <!-- favicons\
    ==================================================-->\
    <link rel="apple-touch-icon" sizes="180x180" href="sdalogo.webp">\
    <link rel="icon" type="image/png" sizes="32x32" href="sdalogo.webp">\
    <link rel="icon" type="image/png" sizes="16x16" href="sdalogo.webp">\
    <link rel="manifest" href="site.webmanifest">\
\
    <!-- Environment Configuration\
    ==================================================-->\
    <script type="module" src="js/env-config.js?v=2"></script>\
\
    <!-- scripts\
    ==================================================-->\
    <script src="js/modernizr.js"></script>\
    <script type="module" src="js/firebase-config.js"></script>\
    <script type="module" src="js/config-service.js"></script>\
    <script type="module" src="js/shared-config.js"></script>' "$file"
    fi
done
