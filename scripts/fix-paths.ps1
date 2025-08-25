$ErrorActionPreference = "Stop"

# Get all HTML files in the repository
$htmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        
        # Calculate the relative path from current file to root
        $relativePath = ""
        $depth = ($file.DirectoryName -replace [regex]::Escape($PWD.Path), "").Trim("\").Split("\\").Count
        if ($depth -gt 0) {
            $relativePath = "../" * $depth
        }
        
        # Skip if already relative
        if ($content -match "href=['\"]\.\./" -or $content -match "src=['\"]\.\./" -or $content -match "url\s*\(['\"]\.\./") {
            Write-Host "Skipping (already relative): $($file.FullName)"
            continue
        }
        
        # Replace absolute paths with relative paths
        $patterns = @(
            @{pattern = 'href="/'; replace = "href=`"$relativePath" },
            @{pattern = 'src="/'; replace = "src=`"$relativePath" },
            @{pattern = 'url\(\s*["\']?/'; replace = "url($relativePath" }
        )
        
        foreach ($item in $patterns) {
            $content = $content -replace $item.pattern, $item.replace
        }
        
        # Save the file if changes were made
        $currentContent = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        if ($content -ne $currentContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            Write-Host "Updated: $($file.FullName)"
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "Path conversion complete!" -ForegroundColor Green
