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
$reader.ReadLine() | Out-Null
Send-Command "USER 82088c2713632c" | Out-Null
Send-Command "PASS d5a3b5bdec563d" | Out-Null
$stat = Send-Command "STAT"
if ($stat -match "^\+OK (\d+)") {
    $count = [int]$matches[1]
    Write-Host "Total emails: $count"
    if ($count -gt 0) {
        $start = [Math]::Max(1, $count - 2)
        for ($i = $count; $i -ge $start; $i--) {
            Write-Host "`n--- Email $i ---"
            Send-Command "TOP $i 10" | Out-Null
            while ($stream.DataAvailable) { 
                $line = $reader.ReadLine()
                if ($line -match "^Subject: " -or $line -match "^Date: ") { Write-Host $line }
                if ($line -match "status-value") {
                    $valLine = $reader.ReadLine()
                    Write-Host "Status Value snippet: $line $valLine"
                }
            }
        }
    }
}
Send-Command "QUIT" | Out-Null




