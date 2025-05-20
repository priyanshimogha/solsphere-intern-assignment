#!/bin/bash

echo "Starting System Health Monitor components..."

# Start MongoDB (if installed locally)
echo "Starting MongoDB..."
mongod --dbpath=data/db &

# Start Backend Server
echo "Starting Backend Server..."
cd backend
node server.js &
cd ..

# Start Admin Dashboard
echo "Starting Admin Dashboard..."
cd admin-dashboard
npm run dev &
cd ..

# Start System Utility (for testing)
echo "Starting System Utility..."
cd system-utility
python system_monitor.py &
cd ..

echo "All components started!"
echo ""
echo "Backend Server: http://localhost:3000"
echo "Admin Dashboard: http://localhost:5173"
echo ""
echo "Press Ctrl+C to exit..."

# Wait for user to press Ctrl+C
wait
