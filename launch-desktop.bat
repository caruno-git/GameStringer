@echo off
echo 🚀 Avvio GameStringer Desktop...
echo.
echo Chiudo processi bloccanti...
taskkill /f /im msedgewebview2.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Avvio applicazione desktop...
cd src-tauri
set RUST_BACKTRACE=1
REM --jobs 1 rimosso 2026-05-20: usa tutti i core (build ~4 min invece di ~25)
cargo run --release

pause
