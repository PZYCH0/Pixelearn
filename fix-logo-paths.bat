@echo off
setlocal enabledelayedexpansion

for %%f in (
    "ActivityManagerMain.html"
    "ClassroomChampion.html"
    "coming_soon.html"
    "index.html"
    "PunkdoroMain.html"
    "TicTacTense.html"
    "To_Do.html"
) do (
    if exist "%%~f" (
        powershell -Command "(Get-Content '%%~f') -replace 'src=[\"\']\.\./assets/15\.png[\"\']', 'src=\"assets/15.png\"' | Set-Content '%%~f' -Encoding UTF8"
        echo Fixed logo path in: %%~f
    ) else (
        echo File not found: %%~f
    )
)

echo All logo paths have been fixed!
