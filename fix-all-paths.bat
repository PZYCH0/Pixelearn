@echo off
setlocal enabledelayedexpansion

for /r .\ %%f in (*.html) do (
    echo Processing: %%f
    powershell -Command "$content = Get-Content '%%f' -Raw; $depth = (Resolve-Path '%%~dpf' -Relative).Split('\').Count - 1; $relPath = ''; for($i=0; $i -lt $depth; $i++) { $relPath += '../' }; $content = $content -replace 'href=\"\/', 'href=\"' + $relPath; $content = $content -replace 'src=\"\/', 'src=\"' + $relPath; $content = $content -replace 'url\(\\s*[\'\'']?\/', 'url(' + $relPath; [System.IO.File]::WriteAllText('%%f', $content, [System.Text.Encoding]::UTF8)"
)

echo All HTML files have been updated.
