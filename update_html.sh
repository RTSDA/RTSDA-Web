#!/bin/bash

# Add Firebase scripts to all HTML files except styles.html
for file in *.html; do
    if [ "$file" != "styles.html" ]; then
        # Check if the file already has the Firebase scripts
        if ! grep -q "firebase-config.js" "$file"; then
            # Find the closing head tag
            sed -i '' '/<\/head>/i\
    <!-- Firebase -->\
    <script type="module" src="js/firebase-config.js"></script>\
    <script type="module" src="js/config-service.js"></script>\
    <script type="module" src="js/shared-config.js"></script>' "$file"
        fi
    fi
done
