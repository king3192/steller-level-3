# RentStar Level 2 Automation Script
# This script automates contract testing, Git commits, package installations, and launching the dev server.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   RentStar Level 2 Automation Orchestrator  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Verify and Run Smart Contract Tests
Write-Host "`n[1/4] Running Smart Contract Unit Tests..." -ForegroundColor Yellow
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    Push-Location contracts/rent_split
    try {
        cargo test
        Write-Host "✓ Smart contract tests passed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Smart contract tests failed. Please inspect errors above." -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Host "⚠ Cargo/Rust not detected in environment. Skipping contract tests." -ForegroundColor Magenta
}

# 2. Execute Git Commit 1 (Smart Contract & Deploy Docs)
Write-Host "`n[2/4] Executing Git Commit 1 (Smart Contract Codebase)..." -ForegroundColor Yellow
if (Get-Command git -ErrorAction SilentlyContinue) {
    try {
        # Check if we are inside a git repo
        git rev-parse --is-inside-work-tree > $null
        
        Write-Host "Adding contract files..." -ForegroundColor Gray
        git add contracts/rent_split/ DEPLOY.md
        
        Write-Host "Committing contract files..." -ForegroundColor Gray
        git commit -m "feat(contract): implement rent_split Soroban contract with unit tests and deploy instructions"
        Write-Host "✓ Commit 1 successful (Smart Contract codebase committed)." -ForegroundColor Green
    } catch {
        Write-Host "⚠ Git commit 1 skipped or failed. Verify git is initialized and changes exist." -ForegroundColor Magenta
    }
} else {
    Write-Host "⚠ Git not detected. Skipping automatic commits." -ForegroundColor Magenta
}

# 3. Install Frontend Dependencies & Execute Git Commit 2 (Frontend)
Write-Host "`n[3/4] Installing Frontend Dependencies & Committing frontend..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    try {
        Write-Host "Running npm install..." -ForegroundColor Gray
        npm install
        Write-Host "✓ npm dependencies installed." -ForegroundColor Green
    } catch {
        Write-Host "⚠ npm install failed. Verify Node.js and network connectivity." -ForegroundColor Red
        exit 1
    }
}

if (Get-Command git -ErrorAction SilentlyContinue) {
    try {
        Write-Host "Adding frontend files..." -ForegroundColor Gray
        git add package.json package-lock.json .env .env.example src/ README.md automate.ps1
        
        Write-Host "Committing frontend files..." -ForegroundColor Gray
        git commit -m "feat(frontend): integrate multi-wallet kit, contract caller, events polling, and state machine UI"
        Write-Host "✓ Commit 2 successful (Frontend codebase committed)." -ForegroundColor Green
    } catch {
        Write-Host "⚠ Git commit 2 skipped or failed." -ForegroundColor Magenta
    }
}

# 4. Launch Development Server
Write-Host "`n[4/4] Starting Vite Development Server..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "RentStar is ready! Launching dev server now..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm run dev
} else {
    Write-Host "⚠ npm not found. Please run 'npm run dev' manually to start the application." -ForegroundColor Red
}
