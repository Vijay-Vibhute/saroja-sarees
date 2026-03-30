# Test payment verification
$testOrderId = "order_test_$(Get-Random)"
$testPaymentId = "pay_test_$(Get-Random)"

# These would come from actual Razorpay webhook
$body = @{
    razorpay_order_id = $testOrderId
    razorpay_payment_id = $testPaymentId
    razorpay_signature = "test_signature"
    user_id = 3
    amount = 1000
    items = @(
        @{
            product_id = "s1"
            name = "Test Product"
            quantity = 1
            price = 1000
        }
    )
} | ConvertTo-Json

Write-Host "Testing payment verification..."
Write-Host "Request Body:"
Write-Host $body
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri http://localhost:3001/api/orders/verify `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer test_token"
        } `
        -Body $body
    
    Write-Host "Response:"
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}
