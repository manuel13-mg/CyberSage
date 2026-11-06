#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop CyberSage services

.DESCRIPTION
    Stops all CyberSage backend and frontend services
#>

$ErrorActionPreference = "Stop"

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Info "Stopping CyberSage services..."

# Stop background jobs
$stopped = 0
Get-Job | Where-Object { $_.Name -like "CyberSage-*" } | ForEach-Object {
    Stop-Job $_
    Remove-Job $_
    $stopped++
}

if ($stopped -gt 0) {
    Write-Success "  ✓ Stopped $stopped background job(s)"
}

# Kill any remaining Python/Node processes (fallback)
$processes = Get-Process | Where-Object {
    ($_.ProcessName -eq "python" -and $_.CommandLine -like "*uvicorn*") -or
    ($_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*")
}

foreach ($proc in $processes) {
    try {
        Stop-Process -Id $proc.Id -Force
        Write-Info "  Killed remaining process: $($proc.ProcessName) (PID: $($proc.Id))"
    } catch {
        # Process may have already exited
    }
}

Write-Success "`n✓ All CyberSage services stopped"
