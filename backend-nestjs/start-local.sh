#!/bin/bash

echo "🔧 Starting local development server..."
echo

echo "📊 Syncing database schema..."
npx prisma db push --skip-generate

echo
echo "🔧 Generating Prisma client..."
npx prisma generate

echo
echo "🚀 Starting development server..."
npm run start:dev


