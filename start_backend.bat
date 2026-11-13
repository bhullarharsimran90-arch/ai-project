@echo off
title CogniLearn Backend API
set PATH=C:\Users\hp\AppData\Local\Programs\Python\Python313;C:\Users\hp\AppData\Local\Programs\Python\Python313\Scripts;%PATH%
set PYTHONPATH=%~dp0backend
cd "%~dp0backend"
echo Starting FastAPI Uvicorn Server at http://127.0.0.1:8000 ...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
