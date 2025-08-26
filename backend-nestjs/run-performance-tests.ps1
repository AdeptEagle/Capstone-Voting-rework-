# Performance Testing Suite for Voting System
# This script runs comprehensive performance tests

Write-Host "🚀 VOTING SYSTEM PERFORMANCE TESTING SUITE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if server is running
Write-Host "🔍 Checking if server is running..." -ForegroundColor Yellow
$serverStatus = netstat -an | findstr :3001

if ($serverStatus) {
    Write-Host "✅ Server is running on port 3001" -ForegroundColor Green
} else {
    Write-Host "❌ Server is not running. Please start the server first." -ForegroundColor Red
    Write-Host "   Run: npm run start:dev" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Test 1: Database Performance Test
Write-Host "📊 Test 1: Database Performance Test" -ForegroundColor Cyan
Write-Host "Testing database queries with new field names..." -ForegroundColor White
Write-Host ""

try {
    npx ts-node src/scripts/database-performance-test.ts
    Write-Host ""
    Write-Host "✅ Database performance test completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database performance test failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "⏳ Waiting 5 seconds before next test..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 2: WebSocket Performance Test
Write-Host ""
Write-Host "🔌 Test 2: WebSocket Performance Test" -ForegroundColor Cyan
Write-Host "Testing real-time communication performance..." -ForegroundColor White
Write-Host ""

try {
    npx ts-node src/scripts/websocket-performance-test.ts
    Write-Host ""
    Write-Host "✅ WebSocket performance test completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ WebSocket performance test failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "⏳ Waiting 5 seconds before next test..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 3: API Load Testing with Artillery
Write-Host ""
Write-Host "🚀 Test 3: API Load Testing with Artillery" -ForegroundColor Cyan
Write-Host "Testing API endpoints under load..." -ForegroundColor White
Write-Host ""

try {
    artillery run performance-test.yml
    Write-Host ""
    Write-Host "✅ API load testing completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ API load testing failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 ALL PERFORMANCE TESTS COMPLETED!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Check the results above for performance insights." -ForegroundColor White
Write-Host "💡 Look for any warnings or recommendations." -ForegroundColor White
Write-Host "🎯 Your system is now performance-tested and ready!" -ForegroundColor Green
