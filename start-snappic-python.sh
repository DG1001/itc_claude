#!/bin/bash
echo "Starting Python Flask Snappic implementation..."
cd /workspace/snappic

# Install dependencies if needed
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# Start Flask server with 0.0.0.0 binding for XaresAICoder
python app.py