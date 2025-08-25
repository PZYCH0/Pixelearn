# Fix logo paths in HTML files
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
    $filePath = Join-Path -Path $PWD -ChildPath $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        # Update logo path to use the correct relative path
        $content = $content -replace 'src=[\'\"]\.\./assets/15\.png[\'\"]', 'src="assets/15.png"'
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated logo path in: $file"
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "Logo paths have been fixed!" -ForegroundColor Green
