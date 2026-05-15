param(
    [int]$Port = 0
)

if ($Port -le 0) {
    $localConfigPath = Join-Path $PSScriptRoot "src\\main\\resources\\application-local.properties"
    if (Test-Path $localConfigPath) {
        $configuredPortLine = Get-Content $localConfigPath | Where-Object { $_ -match "^server\.port=" } | Select-Object -First 1
        if ($configuredPortLine) {
            $configuredPortValue = $configuredPortLine.Split("=", 2)[1].Trim()
            if ($configuredPortValue -match "^\d+$") {
                $Port = [int]$configuredPortValue
            }
        }
    }
}

if ($Port -le 0) {
    $Port = 8081
}

Write-Host "Checking port $Port..."
$listenerLines = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"
$pids = @()

foreach ($line in $listenerLines) {
    $tokens = ($line.ToString() -replace "\s+", " ").Trim().Split(" ")
    if ($tokens.Length -ge 5) {
        $pidValue = $tokens[-1]
        if ($pidValue -match "^\d+$") {
            $pids += [int]$pidValue
        }
    }
}

$pids = $pids | Sort-Object -Unique

foreach ($pid in $pids) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue
    if (-not $proc) { continue }

    $isJava = $proc.Name -ieq "java.exe"
    $isAnnasetuBackend = ($proc.CommandLine -like "*ANNASETU\\backend*")

    if ($isJava -and $isAnnasetuBackend) {
        Write-Host "Stopping stale backend process PID $pid on port $Port..."
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "Port $Port is in use by PID $pid ($($proc.Name)). Not stopping automatically."
    }
}

$env:SPRING_PROFILES_ACTIVE = "local"
Write-Host "Starting Annasetu backend with local profile on port $Port..."
mvn spring-boot:run
