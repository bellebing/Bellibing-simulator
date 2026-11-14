# Run once, only after the user has approved the Start Menu changes.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$programs = [Environment]::GetFolderPath('Programs')
$shell = New-Object -ComObject WScript.Shell
$powerShellExe = Join-Path $env:SystemRoot 'System32/WindowsPowerShell/v1.0/powershell.exe'
foreach ($entry in @(
    @{Name = 'Bellibing Simulator – Local'; Arguments = ''},
    @{Name = 'Bellibing Simulator – Stoppa lokal server'; Arguments = ' -Stop'}
)) {
    $shortcutPath = Join-Path $programs ($entry.Name + '.lnk')
    if (Test-Path -LiteralPath $shortcutPath) {
        $existing = $shell.CreateShortcut($shortcutPath)
        if ($existing.Arguments -notlike ('*' + $projectRoot + '*')) {
            throw "En annan genväg finns redan: $shortcutPath"
        }
    }
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $powerShellExe
    $shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $PSScriptRoot 'windows-local.ps1') + '"' + $entry.Arguments
    $shortcut.WorkingDirectory = $projectRoot
    $shortcut.Description = 'Bellibing Simulator lokalt. Befintliga kontodata behålls.'
    $shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,13"
    $shortcut.Save()
    Write-Output $shortcutPath
}
