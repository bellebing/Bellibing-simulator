@echo off
setlocal DisableDelayedExpansion
chcp 65001 >nul
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js saknas. Installera Node.js 22.16 eller senare LTS fran https://nodejs.org/
  echo Stang och oppna sedan startpaketet igen.
  pause
  exit /b 1
)
node "%~dp0scripts\start-bellibing-local.mjs" %*
set "BELLIBING_LOCAL_EXIT=%ERRORLEVEL%"
if not "%BELLIBING_LOCAL_EXIT%"=="0" pause
exit /b %BELLIBING_LOCAL_EXIT%
