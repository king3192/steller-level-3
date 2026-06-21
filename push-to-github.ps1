# push-to-github.ps1
# Automates pushing the RentStar project to GitHub.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       RentStar GitHub Push Automator       " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Verify Git Installation
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[Error] Git is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/ and try again." -ForegroundColor Yellow
    pause
    exit 1
}

# 2. Check Git User Identity
$gitUser = git config --get user.name
$gitEmail = git config --get user.email

if ([string]::IsNullOrEmpty($gitUser) -or [string]::IsNullOrEmpty($gitEmail)) {
    Write-Host "[Warning] Git user identity is not set." -ForegroundColor Yellow
    Write-Host "Let us configure it now." -ForegroundColor Cyan
    $name = Read-Host "Enter your Git User Name"
    $email = Read-Host "Enter your Git Email Address"
    
    if (-not [string]::IsNullOrEmpty($name) -and -not [string]::IsNullOrEmpty($email)) {
        git config --global user.name "$name"
        git config --global user.email "$email"
        Write-Host "[OK] Git user identity configured successfully." -ForegroundColor Green
    } else {
        Write-Host "[Error] Identity config skipped. Committing may fail." -ForegroundColor Red
    }
} else {
    Write-Host "[OK] Git Identity: $gitUser <$gitEmail>" -ForegroundColor Green
}

# 3. Add Remote Origin
$remoteUrl = "https://github.com/king3192/steller-level-2.git"
Write-Host "`nSetting up remote origin to: $remoteUrl" -ForegroundColor Yellow

$remotes = git remote
if ($remotes -contains "origin") {
    $existingRemote = git remote get-url origin
    if ($existingRemote -ne $remoteUrl) {
        Write-Host "Updating existing remote origin from $existingRemote to $remoteUrl" -ForegroundColor Gray
        git remote set-url origin $remoteUrl
    } else {
        Write-Host "[OK] Remote origin is already set correctly." -ForegroundColor Green
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "[OK] Remote origin added." -ForegroundColor Green
}

# 4. Stage and Commit Files
Write-Host "`nChecking for changes to commit..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "Changes detected. Staging files..." -ForegroundColor Gray
    git add .
    
    $commitMsg = Read-Host "Enter commit message (Press Enter for default: feat: initial setup of steller level 2 project)"
    if ([string]::IsNullOrEmpty($commitMsg)) {
        $commitMsg = "feat: initial setup of steller level 2 project"
    }
    
    Write-Host "Committing changes..." -ForegroundColor Gray
    git commit -m "$commitMsg"
    Write-Host "[OK] Changes committed." -ForegroundColor Green
} else {
    Write-Host "[OK] No changes to commit (working tree clean or already committed)." -ForegroundColor Green
}

# 5. Rename default branch to main
Write-Host "`nEnsuring branch name is main..." -ForegroundColor Yellow
git branch -M main
Write-Host "[OK] Branch renamed to main." -ForegroundColor Green

# 6. Push to GitHub
Write-Host "`nPushing to GitHub (origin main)..." -ForegroundColor Yellow
Write-Host "NOTE: If a credentials window pops up, please log in or provide your GitHub Personal Access Token." -ForegroundColor Cyan

try {
    git push -u origin main
    Write-Host "`n=============================================" -ForegroundColor Green
    Write-Host "[Success] Your project is now on GitHub!" -ForegroundColor Green
    Write-Host "Repository: $remoteUrl" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
} catch {
    Write-Host "`n[Error] Push failed. Possible reasons:" -ForegroundColor Red
    Write-Host "1. You do not have write permissions to the repository $remoteUrl" -ForegroundColor Red
    Write-Host "2. Authentication failed (incorrect credentials / token)" -ForegroundColor Red
    Write-Host "3. Network issues" -ForegroundColor Red
    Write-Host "`nTo try pushing manually, run this command in your terminal:" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
}

pause
