@echo off
setlocal
title OREF Monitor — public (npm run prod:domain)
cd /d "%~dp0"

if not exist "package.json" (
  echo [ERROR] package.json not found. Move this file inside your oref repo root ^(same folder as package.json^).
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm is not in PATH. Install Node.js from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

if not exist "cloudflared\config.yml" (
  echo [WARN] cloudflared\config.yml is missing. Named tunnel will not start until you copy and edit cloudflared\config.yml.example
  echo        See cloudflared\SETUP.txt — or use CLOUDFLARE_TUNNEL_TOKEN with: npm run prod:token
  echo.
)

call npm run prod:domain
echo.
echo Process ended.
pause
