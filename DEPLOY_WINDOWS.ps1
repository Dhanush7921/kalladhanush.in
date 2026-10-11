# KD Portfolio: interactive, safety-first replacement of the old Astro repo.
# Run INSIDE the extracted ZIP folder, using PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\DEPLOY_WINDOWS.ps1
# Requires: Node.js 22+, npm, git and GitHub sign-in / push permission.
$ErrorActionPreference = 'Stop'
$source = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $source
Write-Host "Kalla Dhanush portfolio: build and deploy" -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js not found. Install Node.js 22 or later.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm not found.' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git not found.' }
$major = [int]((& node -p 'process.versions.node.split(".")[0]').Trim())
if ($major -lt 22) { throw 'Node.js 22 or newer recommended; install before proceeding.' }
Write-Host 'Installing packages and generating package-lock.json...'
& npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install failed. No live site was changed.' }
Write-Host 'Checking types and building the production site...'
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed. No live site was changed.' }
if (-not (Test-Path (Join-Path $source 'dist/index.html'))) { throw 'No production index.html. No live site was changed.' }
Write-Host 'BUILD PASSED. Review all public content before publishing.' -ForegroundColor Green
Write-Host 'Sensitive items in current ZIP: email, Instagram, job role and 3 confidential client/company project cards.' -ForegroundColor Yellow
$approval = Read-Host 'After confirming that their publication is permitted, type PUBLISH (otherwise Enter to stop)'
if ($approval -cne 'PUBLISH') { Write-Host 'Stopped safely. Your original GitHub website is unchanged.'; exit 0 }
$checkout = Join-Path $env:TEMP ('kalladhanush-deploy-' + [guid]::NewGuid().ToString('N'))
Write-Host "Cloning current main into $checkout"
& git clone --branch main --single-branch 'https://github.com/Dhanush7921/kalladhanush.in.git' $checkout
if ($LASTEXITCODE -ne 0) { throw 'Could not clone repository. No live site was changed.' }
Set-Location $checkout
# A dedicated recoverable backup branch has already been created:
# https://github.com/Dhanush7921/kalladhanush.in/tree/backup-before-react-20261011
Write-Host 'Replacing the checkout contents (not the original ZIP or backup branch)...'
& git rm -r -q --ignore-unmatch .
if ($LASTEXITCODE -ne 0) { throw 'Could not clear tracked files.' }
foreach ($dir in @('src','public','.github')) {
  Copy-Item -LiteralPath (Join-Path $source $dir) -Destination (Join-Path $checkout $dir) -Recurse -Force
}
foreach ($name in @('package.json','package-lock.json','index.html','tsconfig.json','vite.config.ts','.gitignore','README.md','DEPLOY_WINDOWS.ps1')) {
  $from = Join-Path $source $name
  if (Test-Path $from) { Copy-Item -LiteralPath $from -Destination (Join-Path $checkout $name) -Force }
}
& git add -A
if ($LASTEXITCODE -ne 0) { throw 'git add failed.' }
& git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace/patch check failed.' }
Write-Host 'Prepared changes:'
& git diff --cached --stat
$confirm = Read-Host 'Type PUSH to commit and publish to the public main branch'
if ($confirm -cne 'PUSH') { Write-Host "Stopped; prepared checkout remains at $checkout"; exit 0 }
& git commit -m 'Deploy Kalla Dhanush premium React portfolio'
if ($LASTEXITCODE -ne 0) { throw 'Commit failed; no remote files changed.' }
& git push origin main
if ($LASTEXITCODE -ne 0) { throw 'Push failed. Check Git credentials or branch protection.' }
Write-Host 'Push completed. Check GitHub Actions and Pages deployment result before updating GoDaddy DNS.' -ForegroundColor Green
Write-Host 'https://github.com/Dhanush7921/kalladhanush.in/actions'
Write-Host 'https://github.com/Dhanush7921/kalladhanush.in/settings/pages'
