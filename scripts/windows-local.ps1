param([switch]$Stop)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
try {
    Set-Location -LiteralPath $projectRoot
    $nodeExe = (Get-Command node -ErrorAction Stop).Source
    if ($Stop) {
        & $nodeExe (Join-Path $PSScriptRoot 'windows-local.mjs') --stop
        if ($LASTEXITCODE -ne 0) { throw 'Kunde inte stoppa den lokala servern.' }
    } else {
        $logDirectory = Join-Path $projectRoot 'artifacts/windows-local'
        New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
        # Each click has its own log; duplicate clicks never truncate the server log.
        $clickLog = Join-Path $logDirectory ("start-{0}.log" -f $PID)
        # Windows PowerShell treats native stderr as ErrorRecord, even for warnings.
        $ErrorActionPreference = 'Continue'
        & $nodeExe (Join-Path $PSScriptRoot 'windows-local.mjs') *> $clickLog
        $ErrorActionPreference = 'Stop'
        if ($LASTEXITCODE -ne 0) {
            $details = Get-Content -LiteralPath $clickLog -Tail 14 | Out-String
            throw "Starten misslyckades.`n$details`nLogg: $clickLog"
        }
    }
} catch {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($_.Exception.Message, 'Bellibing Simulator – startfel', 'OK', 'Error') | Out-Null
    exit 1
}
