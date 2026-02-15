@echo off
REM RogueGPT CLI Launcher for Windows

REM Navigate to the project directory
cd /d "%~dp0"

REM Run the CLI version
npm run dev -w packages/cli

REM Pause to keep window open if there are errors
pause