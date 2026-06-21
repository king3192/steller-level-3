@echo off
title RentStar GitHub Push Automator
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push-to-github.ps1"
