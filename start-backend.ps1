# Kill whatever is on port 3000, then start the backend
$port = 3000
$pids = (netstat -ano | Select-String ":$port\s" | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique)

foreach ($p in $pids) {
    if ($p -match '^\d+$') {
        Write-Host "Killing PID $p on port $port..."
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Starting backend..."
Set-Location "$PSScriptRoot\Backend"
npm run dev
