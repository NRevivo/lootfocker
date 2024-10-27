#!/bin/bash

# בדיקת אם השירות כבר פועל והפעלתו או אתחולו בהתאם
echo "Starting MongoDB service..."
brew services list | grep 'mongodb-community@6.0.*started' &> /dev/null

if [ $? -eq 0 ]; then
  echo "MongoDB service is already running. Restarting..."
  brew services restart mongodb-community@6.0
else
  brew services start mongodb-community@6.0
fi

# הפעלת השרת Node.js
echo "Starting Nodemon.js server..."
Nodemon server.js
