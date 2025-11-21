@echo off
REM prisma-dev-cmd.bat - Prisma commands for development environment (SQLite)

if "%1"=="" (
    echo Usage: prisma-dev-cmd.bat [migrate^|push^|studio^|generate^|init]
    exit /b 1
)

REM Backup original schema
copy "db\schema.prisma" "db\schema.prisma.backup" >nul

REM Create SQLite schema
echo datasource db { > "db\schema.prisma"
echo   provider = "sqlite" >> "db\schema.prisma"
echo   url      = env("DATABASE_URL") >> "db\schema.prisma"
echo } >> "db\schema.prisma"
echo. >> "db\schema.prisma"
echo generator client { >> "db\schema.prisma"
echo   provider        = "prisma-client-js" >> "db\schema.prisma"
echo } >> "db\schema.prisma"

REM Copy models manually from the main schema
REM For this basic version, we'll just work with the simple schema
REM In a real scenario, you'd want to copy all your models

REM Set environment variable and run Prisma command
set DATABASE_URL=file:./dev.db

if "%1"=="migrate" (
    echo Running Prisma migrate for SQLite...
    npx prisma migrate dev
) else if "%1"=="push" (
    echo Running Prisma db push for SQLite...
    npx prisma db push
) else if "%1"=="studio" (
    echo Starting Prisma Studio for SQLite...
    npx prisma studio
) else if "%1"=="generate" (
    echo Generating Prisma client for SQLite...
    npx prisma generate
) else if "%1"=="init" (
    echo Initializing SQLite database...
    if not exist dev.db (
        echo. > dev.db
        echo Created dev.db file
    )
    npx prisma db push
) else (
    echo Invalid command. Use migrate, push, studio, generate, or init.
    goto :restore
)

:restore
REM Restore original schema
copy "db\schema.prisma.backup" "db\schema.prisma" >nul
del "db\schema.prisma.backup" >nul
echo Original schema restored.
echo Development Prisma command completed: %1