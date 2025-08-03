# Voting System Status Check
# This script checks if both applications are running

Write-Host "🔍 Checking Voting System Status..." -ForegroundColor Green
Write-Host ""

# Check if ports are in use
$backendPort = 3001
$frontendPort = 3000

Write-Host "📡 Backend (Port $backendPort):" -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:$backendPort/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is running and healthy!" -ForegroundColor Green
    Write-Host "   Response: $($backendResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎨 Frontend (Port $frontendPort):" -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$frontendPort" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend is running!" -ForegroundColor Green
    Write-Host "   Status: $($frontendResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Frontend is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "   Health Check: http://localhost:3001/health" -ForegroundColor White

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Test the API at http://localhost:3001/health" -ForegroundColor White
Write-Host "3. Check API documentation at http://localhost:3001/api/docs" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 