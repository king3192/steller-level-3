@echo off
title RentStar Level 2 Automator
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0automate.ps1"
pause
