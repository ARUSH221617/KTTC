#!/bin/bash
# prisma-dev.sh - Prisma commands for development environment (SQLite)

export DATABASE_PROVIDER=sqlite
export DATABASE_URL="file:./dev.db"

if [ "$1" = "migrate" ]; then
  npx prisma migrate dev
elif [ "$1" = "push" ]; then
  npx prisma db push
elif [ "$1" = "studio" ]; then
  npx prisma studio
elif [ "$1" = "generate" ]; then
  npx prisma generate
else
  echo "Usage: ./prisma-dev.sh [migrate|push|studio|generate]"
  exit 1
fi