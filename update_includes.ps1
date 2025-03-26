$viewsDir = "c:\Users\Launchpad\Best-University-Registration\views"

# Get all EJS files except those in the partials directory
$ejsFiles = Get-ChildItem -Path $viewsDir -Filter "*.ejs" -Recurse | Where-Object { $_.DirectoryName -notlike "*\partials" }

foreach ($file in $ejsFiles) {
    Write-Host "Processing $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if file is in a subdirectory
    if ($file.DirectoryName -ne $viewsDir) {
        # Replace include paths for files in subdirectories
        $updatedContent = $content -replace "include\(['`"]partials/header['`"]\)", "include('../partials/header')" `
                                  -replace "include\(['`"]partials/footer['`"]\)", "include('../partials/footer')"
        
        # Write updated content back to file
        Set-Content -Path $file.FullName -Value $updatedContent
        
        # Report changes
        if ($content -ne $updatedContent) {
            Write-Host "Updated include paths in $($file.Name)" -ForegroundColor Green
        } else {
            Write-Host "No changes needed for $($file.Name)" -ForegroundColor Yellow
        }
    }
}

Write-Host "All EJS files have been processed." -ForegroundColor Cyan
