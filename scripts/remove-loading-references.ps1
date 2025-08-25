# PowerShell script to remove loading screen references from all HTML files except index.html

# Get all HTML files except index.html
$files = Get-ChildItem -Path . -Recurse -Include "*.html" -Exclude "index.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove loading-screen.css link
    $content = $content -replace '(?s)<link[^>]*?loading-screen\.css[^>]*>\s*', ''
    
    # Remove loading-handler.js script
    $content = $content -replace '(?s)<script[^>]*?loading-handler\.js[^>]*>\s*</script>\s*', ''
    
    # Save the changes
    if ($content -ne (Get-Content $file.FullName -Raw)) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "All HTML files have been updated to remove loading screen references."
