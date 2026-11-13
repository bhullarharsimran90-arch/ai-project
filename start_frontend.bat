@echo off
title CogniLearn Frontend Dev Server
set PATH=C:\Users\hp\AppData\Local\Programs\node-portable\node-v20.18.0-win-x64;%PATH%
cd "%~dp0frontend"
echo Starting Vite Frontend Development Server at http://localhost:5173 ...
npm run dev
pause
