# Simple script to convert absolute paths to relative paths

# Get all HTML files
$htmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $depth = ($file.DirectoryName -replace [regex]::Escape($PWD.Path), "").Trim("\").Split("\").Count
    $relativePath = ""
    
    if ($depth -gt 0) {
        $relativePath = "../" * $depth
    }
    
    # Replace patterns
    $patterns = @(
        @{old = 'href="/'; new = 'href="' + $relativePath },
        @{old = 'src="/'; new = 'src="' + $relativePath },
        @{old = 'url\(\s*["\']?/'; new = 'url(' + $relativePath }
    )
    
    foreach ($p in $patterns) {
        $content = $content -replace $p.old, $p.new
    }
    
    # Save changes
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "Path conversion complete!"
