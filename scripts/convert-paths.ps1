# Convert absolute paths to relative paths in HTML files (no backups)

# Get all HTML files in the repository
$htmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Calculate the relative path from the current file to the root
    $relativePathToRoot = ""
    $depth = ($file.DirectoryName -replace [regex]::Escape($PWD.Path), "").Trim("\").Split("\").Count
    if ($depth -gt 0) {
        $relativePathToRoot = "../" * $depth
    }
    
    # Replace absolute paths with relative paths
    $content = $content -replace '([\'"])/(?!/|assets/|scripts/|styles/)([^\'"]*?)([\'"])', "`$1$relativePathToRoot`$2`$3"
    $content = $content -replace '([\'"])/(assets/|scripts/|styles/)', "`$1$relativePathToRoot`$2"
    
    # Fix double dots in paths
    $content = $content -replace '([\'"])/\.\./([^\'"]*?)([\"'])', "`$1$relativePathToRoot`$2`$3"
    
    # Save the file
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "Path conversion complete!"
