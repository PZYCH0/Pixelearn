$files = @(
    "ActivityManagerMain.html",
    "ClassroomChampion.html",
    "coming_soon.html",
    "index.html",
    "PunkdoroMain.html",
    "TicTacTense.html",
    "To_Do.html"
)

foreach ($file in $files) {
    $filePath = "$PWD\$file"
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $content = $content -replace 'src=[\'\"]\.\./assets/15\.png[\'\"]', 'src="assets/15.png"'
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed logo in $file"
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "Logo paths have been fixed!" -ForegroundColor Green
