@echo off
title MediChain Local Launcher
echo ===================================================
echo     MediChain Decentralized Healthcare System
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/4] Starting Local Hardhat Blockchain Node (port 8545)...
start "MediChain Hardhat Node" cmd /k "cd /d "%~dp0blockchain" && npx hardhat node"

echo Waiting 5 seconds for blockchain node initialization...
timeout /t 5 /nobreak > nul

echo [2/4] Deploying Smart Contracts to Local Hardhat Network...
cmd /c "cd /d "%~dp0blockchain" && npx hardhat run scripts/deploy.js --network localhost"

echo [3/4] Starting MediChain Backend API (port 5000)...
start "MediChain Backend API" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [4/4] Starting MediChain Frontend Web App (port 5173)...
start "MediChain Frontend App" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo All services launched!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo Blockchain RPC: http://127.0.0.1:8545 (Chain ID: 31337)
echo ===================================================
echo.
pause

