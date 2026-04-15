$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
foreach ($conn in $connections) {
    if ($conn.OwningProcess -gt 4) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Killed PID $($conn.OwningProcess)"
    }
}
