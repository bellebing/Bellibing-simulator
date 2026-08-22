$ErrorActionPreference = 'Stop'
$port = 8765
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootFull = [System.IO.Path]::GetFullPath($root)

function Get-ContentType([string]$path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    '.html' { return 'text/html; charset=utf-8' }
    '.css'  { return 'text/css; charset=utf-8' }
    '.js'   { return 'text/javascript; charset=utf-8' }
    '.json' { return 'application/json; charset=utf-8' }
    '.svg'  { return 'image/svg+xml' }
    '.png'  { return 'image/png' }
    '.ico'  { return 'image/x-icon' }
    default { return 'application/octet-stream' }
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()

Write-Host ''
Write-Host 'Bellibing Echo Lab test server is running.' -ForegroundColor Green
Write-Host "Opening http://localhost:$port/" -ForegroundColor Cyan
Write-Host 'Keep this window open while testing. Close it to stop the app.' -ForegroundColor DarkGray
Write-Host ''

Start-Process "http://localhost:$port/"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $client.Close()
        continue
      }

      while ($true) {
        $header = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($header)) { break }
      }

      $parts = $requestLine.Split(' ')
      $rawTarget = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $rawPath = $rawTarget.Split('?')[0]
      $relative = [System.Uri]::UnescapeDataString($rawPath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }

      $candidate = [System.IO.Path]::GetFullPath((Join-Path $rootFull $relative))
      $insideRoot = $candidate.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)

      if (-not $insideRoot -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $head = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $headBytes = [System.Text.Encoding]::ASCII.GetBytes($head)
        $stream.Write($headBytes, 0, $headBytes.Length)
        $stream.Write($body, 0, $body.Length)
        continue
      }

      $body = [System.IO.File]::ReadAllBytes($candidate)
      $contentType = Get-ContentType $candidate
      $head = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
      $headBytes = [System.Text.Encoding]::ASCII.GetBytes($head)
      $stream.Write($headBytes, 0, $headBytes.Length)
      $stream.Write($body, 0, $body.Length)
    }
    catch {
      Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
    finally {
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
