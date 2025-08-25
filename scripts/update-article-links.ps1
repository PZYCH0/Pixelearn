# PowerShell script to update navigation links in article pages to use absolute paths

# Get all HTML files in the Articles directory
$articleFiles = Get-ChildItem -Path ".\Articles" -Filter "*.html" -Recurse

foreach ($file in $articleFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Update navigation links to use absolute paths
    $content = $content -replace 'href="\.\./index\.html"', 'href="/"'
    $content = $content -replace 'href="\.\./index\.html#([^"]+)"', 'href="/#$1"'
    $content = $content -replace 'href="\.\./styles/', 'href="/styles/'
    $content = $content -replace 'href="\.\./assets/', 'href="/assets/'
    $content = $content -replace 'src="\.\./assets/', 'src="/assets/'
    
    # Update script and stylesheet references
    $content = $content -replace 'src="\.\./scripts/', 'src="/scripts/'
    $content = $content -replace 'href="\.\./scripts/', 'href="/scripts/'
    
    # Save the changes if any modifications were made
    if ($content -ne (Get-Content $file.FullName -Raw)) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "All article files have been updated to use absolute paths."
