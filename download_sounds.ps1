$sounds = @{
    "click.mp3" = "https://pixabay.com/sound-effects/download/mouse-click-153941/"
    "correct.mp3" = "https://pixabay.com/sound-effects/download/correct-6033/"
    "incorrect.mp3" = "https://pixabay.com/sound-effects/download/wrong-47985/"
    "win.mp3" = "https://pixabay.com/sound-effects/download/success-1-6297/"
    "timer.mp3" = "https://pixabay.com/sound-effects/download/clock-ticking-60-second-countdown-118231/"
}

foreach ($sound in $sounds.GetEnumerator()) {
    $outputFile = "sounds\" + $sound.Key
    Write-Host "Downloading $($sound.Key)..."
    Invoke-WebRequest -Uri $sound.Value -OutFile $outputFile
}

Write-Host "All sounds downloaded successfully!"
