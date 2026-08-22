@echo off
setlocal
cd /d "%~dp0"
title Bellibing Echo Lab Test
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
