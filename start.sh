#!/bin/bash

# הפעלת שירות MongoDB
echo "Starting MongoDB service..."
brew services start mongodb-community@6.0

# הפעלת השרת Node.js
echo "Starting Node.js server..."
node server.js
