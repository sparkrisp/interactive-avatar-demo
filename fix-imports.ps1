$files = Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Reemplazar importaciones con extensiones .js
    $updatedContent = $content -replace "from ['\`"](.+)\.js['\`"]", "from '$1'"
    
    # Solo escribir si hay cambios
    if ($content -ne $updatedContent) {
        Write-Host "Actualizando importaciones en $($file.FullName)"
        Set-Content -Path $file.FullName -Value $updatedContent
    }
}

Write-Host "Proceso completado. Se han actualizado las importaciones."
