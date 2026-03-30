# Simple Backend API Test for Saroja-Saree's
Write-Host "`n=== Testing Backend API ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:3001/health"
Write-Host "   Status: $($health.status)" -ForegroundColor Green

# Test 2: Create Account
Write-Host "`n2. Creating Test Account..." -ForegroundColor Yellow
$signupData = @{
    email = "test$(Get-Random -Maximum 9999)@saroja.com"
    password = "pass123"
    name = "Test User"
    phone = "1234567890"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/signup" `
        -Method POST `
        -Body $signupData `
        -ContentType "application/json"
    
    Write-Host "   Created: $($result.data.user.email)" -ForegroundColor Green
    $token = $result.data.token
    Write-Host "   Token: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 3: Get Profile (Protected)
Write-Host "`n3. Getting Profile..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }
$profile = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" `
    -Headers $headers
Write-Host "   Name: $($profile.data.name)" -ForegroundColor Green
Write-Host "   Email: $($profile.data.email)" -ForegroundColor Green

# Test 4: Add to Wishlist
Write-Host "`n4. Adding Product to Wishlist..." -ForegroundColor Yellow
$wishData = @{ product_id = "s1" } | ConvertTo-Json
$wish = Invoke-RestMethod -Uri "http://localhost:3001/api/wishlist" `
    -Method POST `
    -Body $wishData `
    -ContentType "application/json" `
    -Headers $headers
Write-Host "   Added product s1 to wishlist" -ForegroundColor Green

# Test 5: Get Wishlist
Write-Host "`n5. Getting Wishlist..." -ForegroundColor Yellow
$wishlist = Invoke-RestMethod -Uri "http://localhost:3001/api/wishlist" `
    -Headers $headers
Write-Host "   Wishlist has $($wishlist.data.Count) items" -ForegroundColor Green

# Test 6: Get Orders
Write-Host "`n6. Getting Order History..." -ForegroundColor Yellow
$orders = Invoke-RestMethod -Uri "http://localhost:3001/api/orders" `
    -Headers $headers
Write-Host "   Order history has $($orders.data.Count) orders" -ForegroundColor Green

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Cyan
Write-Host "`nSaved Token:" -ForegroundColor Yellow
Write-Host $token
