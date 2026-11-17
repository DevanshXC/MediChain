# MediChain Windows PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    MediChain Decentralized Healthcare System" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/4] Starting Local Hardhat Blockchain Node (port 8545)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\blockchain`" && npx hardhat node"

Write-Host "Waiting 5 seconds for blockchain node..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "`n[2/4] Deploying Smart Contracts..." -ForegroundColor Yellow
Set-Location "$root\blockchain"
cmd /c "npx hardhat run scripts/deploy.js --network localhost"

Write-Host "`n[3/4] Starting Backend API Server (port 5000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\backend`" && npm run dev"

Write-Host "`n[4/4] Starting Frontend Vite App (port 5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "MediChain is ready!" -ForegroundColor Green
Write-Host "Frontend App:    http://localhost:5173" -ForegroundColor White
Write-Host "Backend API:     http://localhost:5000" -ForegroundColor White
Write-Host "Hardhat RPC:     http://127.0.0.1:8545 (Chain ID: 31337)" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green

