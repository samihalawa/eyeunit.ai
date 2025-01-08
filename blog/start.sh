#!/bin/bash

# Kill any existing Python servers
pkill -f "python3 -m http.server"

# Build the blog
echo "Building blog..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Blog built successfully!"
    
    # Start the server
    echo "Starting server on port 8000..."
    python3 -m http.server 8000
else
    echo "Blog build failed!"
    exit 1
fi 