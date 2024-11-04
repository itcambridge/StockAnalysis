#!/bin/bash
# Install dependencies
cd backend && pip3 install -r requirements.txt
cd ../frontend && npm install

# Start both services
python3 ../backend/app.py & 
npm start