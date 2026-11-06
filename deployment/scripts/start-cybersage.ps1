#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start CyberSage application (Backend + Frontend)

.DESCRIPTION
    This script starts the CyberSage backend API and frontend development server.
    It performs health checks and validates the environment before starting.

.PARAMETER SkipChecks
    Skip prerequisite checks and start immediately

.PARAMETER ProductionBuild
    Build and serve frontend production bundle instead of dev server

.EXAMPLE
    .\start-cybersage.ps1
    Starts CyberSage with all checks

.EXAMPLE
    .\start-cybersage.ps1 -ProductionBuild
    Builds frontend for production and starts backend
#>

[CmdletBinding()]
param(
    [switch]$SkipChecks,
    [switch]$ProductionBuild
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Failure { Write-Host $args -ForegroundColor Red }

function Write-Banner {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           CyberSage Startup Script            ║" -ForegroundColor Cyan
    Write-Host "║     AI-Powered Security Assessment Platform    ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Prerequisites {
    Write-Info "==> Checking prerequisites..."

    $errors = @()

    # Check Python
    try {
        $pythonVersion = & python --version 2>&1
        if ($pythonVersion -match "Python 3\.1[12]") {
            Write-Success "  ✓ Python: $pythonVersion"
        } else {
            $errors += "Python 3.11+ required, found: $pythonVersion"
        }
    } catch {
        $errors += "Python not found in PATH"
    }

    # Check Node.js
    try {
        $nodeVersion = & node --version 2>&1
        if ($nodeVersion -match "v1[89]|v2[0-9]") {
            Write-Success "  ✓ Node.js: $nodeVersion"
        } else {
            $errors += "Node.js 18+ required, found: $nodeVersion"
        }
    } catch {
        $errors += "Node.js not found in PATH"
    }

    # Check backend virtual environment
    if (Test-Path "Backend\.venv\Scripts\Activate.ps1") {
        Write-Success "  ✓ Backend virtual environment exists"
    } else {
        $errors += "Backend virtual environment not found. Run: cd Backend; python -m venv .venv"
    }

    # Check backend dependencies
    if (Test-Path "Backend\.venv\Lib\site-packages\fastapi") {
        Write-Success "  ✓ Backend dependencies installed"
    } else {
        $errors += "Backend dependencies missing. Run: cd Backend; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt"
    }

    # Check .env file
    if (Test-Path "Backend\.env") {
        Write-Success "  ✓ Backend configuration exists"
    } else {
        Write-Warning "  ⚠ Backend .env not found. Copying from .env.example..."
        Copy-Item "Backend\.env.example" "Backend\.env"
        Write-Info "    Please edit Backend\.env to configure API keys and database"
    }

    # Check frontend dependencies
    if (Test-Path "Frontend\node_modules") {
        Write-Success "  ✓ Frontend dependencies installed"
    } else {
        $errors += "Frontend dependencies missing. Run: cd Frontend; npm install"
    }

    if ($errors.Count -gt 0) {
        Write-Failure "`n✗ Prerequisite checks failed:"
        foreach ($error in $errors) {
            Write-Failure "  - $error"
        }
        exit 1
    }

    Write-Success "`n✓ All prerequisite checks passed`n"
}

function Test-DatabaseConnection {
    Write-Info "==> Checking database connection..."

    # Read DATABASE_URL from .env
    $envContent = Get-Content "Backend\.env" -Raw
    if ($envContent -match "DATABASE_URL=(.+)") {
        $dbUrl = $Matches[1].Trim()

        if ($dbUrl -like "postgresql*") {
            Write-Info "  PostgreSQL database configured"
            # TODO: Add actual connection test
            Write-Success "  ✓ Database configuration found"
        } elseif ($dbUrl -like "sqlite*") {
            Write-Info "  SQLite database configured (development mode)"
            Write-Success "  ✓ Database configuration found"
        } else {
            Write-Warning "  ⚠ Unknown database type: $dbUrl"
        }
    } else {
        Write-Warning "  ⚠ DATABASE_URL not found in .env, using default"
    }
}

function Start-DatabaseMigrations {
    Write-Info "==> Running database migrations..."

    Push-Location Backend
    try {
        & .\.venv\Scripts\python.exe -m alembic upgrade head 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  ✓ Database migrations complete"
        } else {
            Write-Warning "  ⚠ Migration warnings (check logs)"
        }
    } catch {
        Write-Failure "  ✗ Migration failed: $_"
        exit 1
    } finally {
        Pop-Location
    }
}

function Start-Backend {
    Write-Info "==> Starting backend API..."

    $backendJob = Start-Job -Name "CyberSage-Backend" -ScriptBlock {
        Set-Location $using:PWD\Backend
        & .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    }

    # Wait for backend to be ready
    Write-Info "  Waiting for backend to start..."
    $maxAttempts = 30
    $attempt = 0
    $backendReady = $false

    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempt++

        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $backendReady = $true
                break
            }
        } catch {
            # Backend not ready yet, continue waiting
        }

        # Check if job failed
        if ($backendJob.State -eq "Failed") {
            Write-Failure "  ✗ Backend failed to start"
            Receive-Job $backendJob
            exit 1
        }
    }

    if ($backendReady) {
        Write-Success "  ✓ Backend API is running at http://127.0.0.1:8000"
        Write-Info "    API Documentation: http://127.0.0.1:8000/docs"
        return $backendJob
    } else {
        Write-Failure "  ✗ Backend failed to start within $maxAttempts seconds"
        Stop-Job $backendJob
        Remove-Job $backendJob
        exit 1
    }
}

function Start-Frontend {
    param([bool]$Production = $false)

    if ($Production) {
        Write-Info "==> Building frontend for production..."
        Push-Location Frontend
        try {
            & npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Success "  ✓ Frontend build complete"
                Write-Info "  Serving production build..."

                $frontendJob = Start-Job -Name "CyberSage-Frontend" -ScriptBlock {
                    Set-Location $using:PWD\Frontend\dist
                    python -m http.server 5173
                }

                Start-Sleep -Seconds 2
                Write-Success "  ✓ Frontend available at http://127.0.0.1:5173"
                return $frontendJob
            } else {
                Write-Failure "  ✗ Frontend build failed"
                exit 1
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Info "==> Starting frontend development server..."

        $frontendJob = Start-Job -Name "CyberSage-Frontend" -ScriptBlock {
            Set-Location $using:PWD\Frontend
            & npm run dev
        }

        # Wait for frontend to be ready
        Write-Info "  Waiting for frontend to start..."
        Start-Sleep -Seconds 5

        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            Write-Success "  ✓ Frontend development server running at http://127.0.0.1:5173"
            return $frontendJob
        } catch {
            Write-Warning "  ⚠ Frontend may still be starting (check http://127.0.0.1:5173 in browser)"
            return $frontendJob
        }
    }
}

function Show-ServiceStatus {
    Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          CyberSage is now running!            ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🌐 Frontend:  " -NoNewline -ForegroundColor Cyan
    Write-Host "http://127.0.0.1:5173" -ForegroundColor White
    Write-Host "  🔧 Backend:   " -NoNewline -ForegroundColor Cyan
    Write-Host "http://127.0.0.1:8000" -ForegroundColor White
    Write-Host "  📚 API Docs:  " -NoNewline -ForegroundColor Cyan
    Write-Host "http://127.0.0.1:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Press " -NoNewline
    Write-Host "Ctrl+C" -ForegroundColor Yellow -NoNewline
    Write-Host " to stop all services"
    Write-Host ""
}

# Main execution
try {
    Write-Banner

    if (-not $SkipChecks) {
        Test-Prerequisites
        Test-DatabaseConnection
        Start-DatabaseMigrations
    }

    $backendJob = Start-Backend
    $frontendJob = Start-Frontend -Production $ProductionBuild

    Show-ServiceStatus

    # Monitor jobs
    while ($true) {
        Start-Sleep -Seconds 1

        # Check if either job has failed
        if ($backendJob.State -eq "Failed") {
            Write-Failure "`n✗ Backend has stopped unexpectedly"
            Receive-Job $backendJob
            break
        }

        if ($frontendJob.State -eq "Failed") {
            Write-Failure "`n✗ Frontend has stopped unexpectedly"
            Receive-Job $frontendJob
            break
        }
    }

} catch {
    Write-Failure "`n✗ Error: $_"
    exit 1
} finally {
    # Cleanup on exit
    Write-Info "`nShutting down services..."

    Get-Job | Where-Object { $_.Name -like "CyberSage-*" } | ForEach-Object {
        Stop-Job $_
        Remove-Job $_
    }

    Write-Success "✓ All services stopped"
}
