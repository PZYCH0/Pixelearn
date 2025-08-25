# Fix paths in HTML files
$htmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Calculate relative path
    $depth = ($file.DirectoryName -replace [regex]::Escape($PWD.Path), "").Trim("\").Split("\").Count
    $relativePath = ""
    if ($depth -gt 0) {
        $relativePath = "../" * $depth
    }
    
    # Replace patterns
    $content = $content -replace 'href="/', "href=`"$relativePath"
    $content = $content -replace 'src="/', "src=`"$relativePath"
    
    # Save changes
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "All paths have been updated!" -ForegroundColor Green
