$tcpConnection = New-Object System.Net.Sockets.TcpClient("pop3.mailtrap.io", 1100)
$stream = $tcpConnection.GetStream()
$reader = New-Object System.IO.StreamReader($stream)
$writer = New-Object System.IO.StreamWriter($stream)
$writer.AutoFlush = $true

function Send-Command($cmd) {
    $writer.WriteLine($cmd)
    Start-Sleep -Milliseconds 200
    if ($stream.DataAvailable) { return $reader.ReadLine() }
}

Write-Host "Banner: " $reader.ReadLine()
Write-Host "USER: " (Send-Command "USER 82088c2713632c")
Write-Host "PASS: " (Send-Command "PASS d5a3b5bdec563d")
$stat = Send-Command "STAT"
Write-Host "STAT: " $stat

if ($stat -match "^\+OK (\d+)") {
    $count = [int]$matches[1]
    Write-Host "Total emails: $count"
    if ($count -gt 0) {
        Write-Host "Latest email ($count):"
        Send-Command "TOP $count 10" | Out-Null
        while ($stream.DataAvailable) { Write-Host $reader.ReadLine() }
    }
}
Send-Command "QUIT" | Out-Null
$tcpConnection.Close()
