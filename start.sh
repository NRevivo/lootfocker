#!/bin/bash

# לטעון את משתני הסביבה
if [ -f .env ]; then
    echo "Loading environment variables..."
    export $(cat .env | sed 's/#.*//g' | xargs)
else
    echo "Warning: .env file not found"
fi

# בדיקה אם nodemon מותקן
if ! command -v nodemon &> /dev/null; then
    echo "Nodemon not found. Installing..."
    npm install -g nodemon
fi

# הפעלת השרת Node.js באמצעות Nodemon
echo "Starting Nodemon server..."
nodemon server.js