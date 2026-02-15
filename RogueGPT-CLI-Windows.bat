@echo off
REM RogueGPT CLI Launcher for Windows
TITLE RogueGPT CLI

REM Navigate to the project directory
cd /d "%~dp0"

echo ========================================
echo        RogueGPT CLI Launcher
echo ========================================
echo Starting RogueGPT CLI...
echo.

REM Run the CLI version
npm run dev -w packages/cli

echo.
echo Press any key to close this window...
pause >nul