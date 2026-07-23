$repoPath = "C:\Users\mwall\vaea"
$vaultPath = "C:\Users\mwall\AI Dev Vault"

Write-Output "## Git status"
Push-Location $repoPath
git status --short
Write-Output ""
Write-Output "## Recent commits"
git log --oneline -10
Pop-Location

Write-Output ""
Write-Output "## Vaea-related vault notes (5 most recently updated)"
Get-ChildItem $vaultPath -Recurse -Filter "Vaea*.md" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\\.obsidian\\'
} | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object {
    $relativePath = $_.FullName.Substring($vaultPath.Length + 1)
    Write-Output "--- $relativePath (updated $($_.LastWriteTime)) ---"
    Get-Content $_.FullName
    Write-Output ""
}
