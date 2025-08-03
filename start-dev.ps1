# Voting System Development Startup Script
# This script starts both the frontend and backend in development mode with auto-restart

Write-Host "Starting Voting System Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend (NestJS) with auto-restart..." -ForegroundColor Yellow
Write-Host "   - Will automatically restart when you save files" -ForegroundColor Gray
Write-Host "   - Watching for changes in src/ directory" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend-nestjs; npm run start:dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Frontend (Next.js) with hot reload..." -ForegroundColor Yellow
Write-Host "   - Will automatically refresh when you save files" -ForegroundColor Gray
Write-Host "   - Hot module replacement enabled" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend-nextjs; npm run dev"

Write-Host ""
Write-Host "Both applications are starting with auto-restart enabled!" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend: http://localhost:3001" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Auto-Restart Features:" -ForegroundColor Yellow
Write-Host "   - Backend: Save any .ts file in src/ -> auto-restart" -ForegroundColor Gray
Write-Host "   - Frontend: Save any file -> hot reload" -ForegroundColor Gray
Write-Host ""
Write-Host "Development Tips:" -ForegroundColor Magenta
Write-Host "   - Make changes to your code and save" -ForegroundColor Gray
Write-Host "   - Watch the terminal for restart messages" -ForegroundColor Gray
Write-Host "   - No need to manually restart anything!" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this script (applications will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 