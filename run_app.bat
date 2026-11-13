@echo off
title AI Learning Content & Assessment Platform
echo ======================================================================
echo Starting AI-Assisted Learning Content & Assessment Platform
echo ======================================================================
echo.

set PATH=C:\Users\hp\AppData\Local\Programs\Python\Python313;C:\Users\hp\AppData\Local\Programs\Python\Python313\Scripts;C:\Users\hp\AppData\Local\Programs\node-portable\node-v20.18.0-win-x64;%PATH%

set PYTHONPATH=%~dp0backend

echo Launching unified server (Frontend + Backend) at http://127.0.0.1:8000 ...
python "%~dp0run.py"

pause
