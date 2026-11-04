@echo off
setlocal enabledelayedexpansion
title Pesawaran TourismPay - Server Launcher

:: Set code page UTF-8 agar teks rapi
chcp 65001 >nul

:: Pastikan direktori kerja berada di folder proyek ini
cd /d "%~dp0"

:: Tambahkan path portable Node.js & Git jika ada di AppData
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\git\cmd;%PATH%"

cls
echo ======================================================================
echo          PESAWARAN TOURISMPAY - SISTEM RESERVASI ^& PAD
echo          Kabupaten Pesawaran - Pulau Pahawang, Lampung
echo ======================================================================
echo.

:: 1. Verifikasi instalasi Node.js
where node >nul 2>&1
if %errorlevel% neq 0 goto NO_NODE

:: Tampilkan versi Node.js
for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"
echo [OK] Node.js terdeteksi: %NODE_VER%
goto CHECK_MODULES

:NO_NODE
echo [ERROR] Node.js tidak ditemukan di sistem!
echo Silakan install Node.js atau pastikan node.exe ada di PATH.
echo.
pause
exit /b 1

:CHECK_MODULES
:: 2. Periksa apakah dependensi node_modules sudah ada
if exist "node_modules\" goto CHECK_DB
echo [INFO] Folder node_modules belum ditemukan. Menginstall dependensi...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Gagal menginstall dependensi npm!
    pause
    exit /b 1
)

:CHECK_DB
:: 3. Periksa database SQLite dan Prisma
if exist "prisma\dev.db" goto CHECK_PORT
echo [INFO] Database SQLite belum ditemukan. Menyiapkan database dan data awal...
call npx prisma db push --skip-generate
call npx tsx prisma/seed.ts
echo [OK] Database siap dengan akun demo.

:CHECK_PORT
:: 4. Cek apakah port 3000 sedang digunakan
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 goto MENU_UTAMA

echo.
echo [PERINGATAN] Port 3000 sedang digunakan oleh aplikasi lain / instance sebelumnya.
set "KILL_OLD="
set /p KILL_OLD="Apakah Anda ingin mematikan proses di port 3000 tersebut? [Y/T, default Y]: "
if /i "%KILL_OLD%"=="T" goto MENU_UTAMA

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo [OK] Proses lama di port 3000 berhasil dihentikan.
timeout /t 1 /nobreak >nul

:MENU_UTAMA
echo.
echo ----------------------------------------------------------------------
echo  PILIH MODE OPERASIONAL:
echo ----------------------------------------------------------------------
echo  [1] Jalankan Server Dev (npm run dev)  - [Default / Rekomendasi]
echo  [2] Jalankan Server Prod (npm start)   - [Versi Terkompilasi]
echo  [3] Jalankan Uji 10 Skenario PRD       - [Vitest test suite]
echo  [4] Reset dan Isi Ulang Database       - [Seed ulang 5 akun demo]
echo  [5] Buka URL Web di Browser           - [http://localhost:3000]
echo  [6] Keluar
echo ----------------------------------------------------------------------
echo.

:: Jika ada argumen CLI langsung (contoh: run.cmd dev / run.cmd test)
if "%1"=="dev" goto DEV_SERVER
if "%1"=="start" goto PROD_SERVER
if "%1"=="test" goto RUN_TESTS
if "%1"=="seed" goto RESET_DB
if "%1"=="1" goto DEV_SERVER
if "%1"=="2" goto PROD_SERVER
if "%1"=="3" goto RUN_TESTS
if "%1"=="4" goto RESET_DB
if "%1"=="5" goto OPEN_BROWSER
if "%1"=="6" goto SELESAI

:: Default pilihan [1] dengan batas waktu 5 detik
choice /c 123456 /t 5 /d 1 /m "Pilih opsi [1-6] (Otomatis [1] dalam 5 detik): "
set "PILIHAN=%errorlevel%"

if "%PILIHAN%"=="1" goto DEV_SERVER
if "%PILIHAN%"=="2" goto PROD_SERVER
if "%PILIHAN%"=="3" goto RUN_TESTS
if "%PILIHAN%"=="4" goto RESET_DB
if "%PILIHAN%"=="5" goto OPEN_BROWSER
if "%PILIHAN%"=="6" goto SELESAI

:DEV_SERVER
echo.
echo ======================================================================
echo  Menjalankan Server Development (Next.js)...
echo  Aplikasi akan terbuka otomatis di browser: http://localhost:3000
echo  Tekan Ctrl + C di jendela ini untuk menghentikan server.
echo ======================================================================
echo.
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"
call npm run dev
goto SELESAI

:PROD_SERVER
echo.
echo ======================================================================
echo  Menjalankan Server Production...
echo ======================================================================
if not exist ".next\" (
    echo [INFO] Build production belum ada. Membangun aplikasi terlebih dahulu...
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal melakukan build production!
        pause
        goto SELESAI
    )
)
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
call npm start
goto SELESAI

:RUN_TESTS
echo.
echo ======================================================================
echo  Menjalankan 10 Skenario Uji Wajib PRD Pesawaran TourismPay...
echo ======================================================================
call npx vitest run
echo.
pause
goto SELESAI

:RESET_DB
echo.
echo ======================================================================
echo  Mereset dan mengisi ulang data awal (Seed Database)...
echo ======================================================================
call npx prisma db push --force-reset
call npx tsx prisma/seed.ts
echo.
echo [OK] Database berhasil di-reset dengan 5 akun demo.
pause
goto SELESAI

:OPEN_BROWSER
start http://localhost:3000
goto SELESAI

:SELESAI
echo.
echo Selesai.
exit /b 0
