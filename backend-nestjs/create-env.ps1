# Create .env file for backend
$envContent = @"
DATABASE_URL="postgresql://postgres:root@localhost:5432/voting_system"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ .env file created successfully!"
Write-Host "⚠️  Please edit .env file and replace 'YOUR_PASSWORD' with your actual PostgreSQL password" 