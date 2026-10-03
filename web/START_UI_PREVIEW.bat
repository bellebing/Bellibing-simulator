@echo off
setlocal
cd /d "%~dp0"
title Bellibing UI Preview
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -StartPath "/ui-preview/"
