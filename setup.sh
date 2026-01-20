#!/bin/bash

# Connecta CI - Setup Script

echo "Starting setup for Connecta CI..."

# Backend Setup
echo "-----------------------------------"
echo "Setting up Backend..."
echo "-----------------------------------"
cd backend || exit

echo "Installing backend dependencies..."
npm install

if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "NOTE: Please check .env and update database credentials if necessary."
else
  echo ".env file already exists. Skipping creation."
fi

echo "Running Prisma migrations..."
npm run prisma:migrate

echo "Seeding database..."
npm run prisma:seed

# Frontend Setup
echo "-----------------------------------"
echo "Setting up Frontend..."
echo "-----------------------------------"
cd ../frontend || exit

echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "NOTE: Please check .env and update database credentials if necessary."
else
  echo ".env file already exists. Skipping creation."
fi
echo "-----------------------------------"
echo "Setup Complete! You can now run the app using ./dev.sh"
echo "-----------------------------------"
