# Backend API Test Script for Saroja-Saree's
# Run this script to test all authentication endpoints

Write-Host "`n=== Testing Saroja-Saree's Backend API ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    Write-Host "✓ Health Check: $($health.status) - $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health Check Failed: $_" -ForegroundColor Red
    exit
}

# Test 2: User Signup
Write-Host "`n2. Testing User Signup..." -ForegroundColor Yellow
$signupBody = @{
    email = "testuser@saroja.com"
    password = "test123456"
    name = "Test User"
    phone = "9876543210"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "✓ Signup Success!" -ForegroundColor Green
    Write-Host "  User ID: $($signupResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($signupResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "  Name: $($signupResponse.data.user.name)" -ForegroundColor Gray
    $token = $signupResponse.data.token
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "! User already exists, trying login instead..." -ForegroundColor Yellow
        
        # Test 3: User Login (if signup failed because user exists)
        $loginBody = @{
            email = "testuser@saroja.com"
            password = "test123456"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        Write-Host "✓ Login Success!" -ForegroundColor Green
        Write-Host "  User ID: $($loginResponse.data.user.id)" -ForegroundColor Gray
        Write-Host "  Email: $($loginResponse.data.user.email)" -ForegroundColor Gray
        $token = $loginResponse.data.token
    } else {
        Write-Host "✗ Signup Failed: $_" -ForegroundColor Red
        exit
    }
}

# Test 4: Get User Profile (Protected Route)
Write-Host "`n3. Testing Get Profile (Protected Route)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $profile = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" -Method GET -Headers $headers
    Write-Host "✓ Profile Retrieved!" -ForegroundColor Green
    Write-Host "  ID: $($profile.data.id)" -ForegroundColor Gray
    Write-Host "  Email: $($profile.data.email)" -ForegroundColor Gray
    Write-Host "  Name: $($profile.data.name)" -ForegroundColor Gray
    Write-Host "  Phone: $($profile.data.phone)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get Profile Failed: $_" -ForegroundColor Red
}

# Test 5: Update Profile
Write-Host "`n4. Testing Update Profile..." -ForegroundColor Yellow
try {
    $updateBody = @{
        name = "Updated Test User"
        phone = "1234567890"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $updated = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" -Method PUT -Body $updateBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Profile Updated!" -ForegroundColor Green
    Write-Host "  New Name: $($updated.data.name)" -ForegroundColor Gray
    Write-Host "  New Phone: $($updated.data.phone)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Update Profile Failed: $_" -ForegroundColor Red
}

# Test 6: Add to Wishlist
Write-Host "`n5. Testing Add to Wishlist..." -ForegroundColor Yellow
try {
    $wishlistBody = @{
        product_id = "s1"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $wishlist = Invoke-RestMethod -Uri "http://localhost:3001/api/wishlist" -Method POST -Body $wishlistBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Item Added to Wishlist!" -ForegroundColor Green
    Write-Host "  Wishlist Item ID: $($wishlist.data.id)" -ForegroundColor Gray
} catch {
    Write-Host "! Add to Wishlist: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 7: Get Wishlist
Write-Host "`n6. Testing Get Wishlist..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $wishlistItems = Invoke-RestMethod -Uri "http://localhost:3001/api/wishlist" -Method GET -Headers $headers
    Write-Host "✓ Wishlist Retrieved!" -ForegroundColor Green
    Write-Host "  Total Items: $($wishlistItems.data.Count)" -ForegroundColor Gray
    if ($wishlistItems.data.Count -gt 0) {
        $wishlistItems.data | ForEach-Object {
            Write-Host "  - Product ID: $($_.product_id)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Get Wishlist Failed: $_" -ForegroundColor Red
}

# Test 8: Get Orders
Write-Host "`n7. Testing Get Order History..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $orders = Invoke-RestMethod -Uri "http://localhost:3001/api/orders" -Method GET -Headers $headers
    Write-Host "✓ Order History Retrieved!" -ForegroundColor Green
    Write-Host "  Total Orders: $($orders.data.Count)" -ForegroundColor Gray
    if ($orders.data.Count -gt 0) {
        $orders.data | ForEach-Object {
            Write-Host "  - Order #$($_.order_number): ₹$($_.total_amount) - Status: $($_.status)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Get Orders Failed: $_" -ForegroundColor Red
}

Write-Host "`n=== All Tests Completed! ===" -ForegroundColor Cyan
Write-Host "`nYour JWT Token (save this for manual testing):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor White
