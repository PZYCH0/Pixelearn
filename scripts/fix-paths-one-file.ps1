# Script to fix paths in a single HTML file
param(
    [string]$filePath
)

$content = Get-Content $filePath -Raw

# Calculate relative path
$fileDir = Split-Path -Parent $filePath
$relativePath = ""
$currentDir = $PWD.Path

while ($fileDir -ne $currentDir) {
    $relativePath = "../$relativePath"
    $fileDir = Split-Path -Parent $fileDir
    if ([string]::IsNullOrEmpty($fileDir)) { break }
}

# Replace absolute paths
$content = $content -replace 'href="/', "href=`"$relativePath"
$content = $content -replace 'src="/', "src=`"$relativePath"
$content = $content -replace 'url\(/|\s*["\'']/)', "url($relativePath`$1"

# Save changes
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Updated: $filePath"
