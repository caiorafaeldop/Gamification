#!/bin/bash

# FAMENE ENAMED - Development Script

echo "Starting FAMENE ENAMED in development mode..."

# Function to handle script termination
cleanup() {
  echo "Stopping servers..."
  kill $(jobs -p)
  exit
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo "Starting Backend..."
(cd backend && npm run dev) &

# Wait a moment for backend to initialize (optional loop could be better but sleep is simple)
sleep 5

# Start Frontend
echo "Starting Frontend..."
(cd frontend && npm run dev) &

# Wait for both processes
wait
