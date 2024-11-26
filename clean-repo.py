#!/usr/bin/env python3

import re
from git_filter_repo import Blob, FilteringOptions

def clean_sensitive_data(blob):
    data = blob.data
    
    # Replace Google API keys
    data = re.sub(b'AIzaSy[A-Za-z0-9_-]{33}', b'REMOVED_GOOGLE_API_KEY', data)
    
    # Replace Firebase config
    data = re.sub(b'[A-Za-z0-9_-]{39}\.apps\.googleusercontent\.com', b'REMOVED_FIREBASE_CLIENT_ID', data)
    data = re.sub(b'[A-Za-z0-9_-]{24}', b'REMOVED_FIREBASE_API_KEY', data)
    
    if data != blob.data:
        blob.data = data
