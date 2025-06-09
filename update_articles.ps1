$articleFiles = Get-ChildItem -Path "C:\Users\Pc\Desktop\Pixelearn\Articles\*.html"

foreach ($file in $articleFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file already has the navbar-font-styles.css link
    if ($content -notmatch "navbar-font-styles\.css") {
        # Insert the new CSS link after the portfolio.css link
        $updatedContent = $content -replace '(<link href="../styles/portfolio.css" rel="stylesheet"/>)', '$1
<link href="../styles/navbar-font-styles.css" rel="stylesheet"/>'
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $updatedContent
        
        Write-Host "Updated $($file.Name)"
    } else {
        Write-Host "$($file.Name) already has the navbar-font-styles.css link"
    }
}
