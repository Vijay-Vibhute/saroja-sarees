import React, { useState, useEffect } from 'react';
import { fetchProducts, urlFor } from '../lib/sanity';
import { initializeRazorpay, createRazorpayOrder, verifyPayment, formatPrice } from '../utils/razorpay';
import { ProcessedProduct, CheckoutFormData, RazorpayOrderResponse } from '../types/sanity';

export default function SanityProductList() {
  const [products, setProducts] = useState<ProcessedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProcessedProduct | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
  });

  // Fetch products from Sanity on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();

        // Process products to include image URLs
        const processedProducts = data.map((product: any) => ({
          ...product,
          imageUrl: product.image?.asset?.url || '',
        }));

        setProducts(processedProducts);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /**
   * Handle product purchase
   */
  const handleBuy = async (product: ProcessedProduct) => {
    if (!product.price) {
      setError('Invalid product price');
      return;
    }

    setSelectedProduct(product);
    setShowCheckout(true);
  };

  /**
   * Handle checkout form submission
   */
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    try {
      setProcessingPayment(true);
      setError(null);

      // Step 1: Create order on your backend
      const order = await createRazorpayOrder(selectedProduct.price, {
        product_id: selectedProduct._id,
        product_title: selectedProduct.title,
        customer_email: checkoutForm.email,
      });

      // Step 2: Initialize Razorpay checkout
      await initializeRazorpay(
        {
          amount: selectedProduct.price * 100, // Convert to paise
          receipt: order.id,
          notes: {
            product_id: selectedProduct._id,
            product_title: selectedProduct.title,
          },
        },
        checkoutForm,
        // On Success
        async (response) => {
          try {
            // Step 3: Verify payment on backend
            const verificationResult = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verificationResult.success) {
              alert(
                `✅ Payment successful! Order ID: ${response.razorpay_order_id}\n\nThank you for your purchase!`
              );
              setShowCheckout(false);
              setCheckoutForm({
                fullName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postalCode: '',
                state: '',
              });
              setSelectedProduct(null);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('Payment verification failed. Please try again.');
            console.error(err);
          } finally {
            setProcessingPayment(false);
          }
        },
        // On Error
        (err) => {
          setError(err.message || 'Payment failed. Please try again.');
          setProcessingPayment(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setProcessingPayment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Error message */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #fca5a5',
          }}
        >
          {error}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Checkout</h2>

            {/* Product Summary */}
            <div
              style={{
                backgroundColor: '#f3f4f6',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>{selectedProduct.title}</h3>
              <p style={{ margin: '5px 0' }}>
                <strong>Price:</strong> {formatPrice(selectedProduct.price)}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Category:</strong> {selectedProduct.category}
              </p>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckoutSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.fullName}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, fullName: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.address}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, address: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.state}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, state: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.postalCode}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, postalCode: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={processingPayment}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: processingPayment ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: processingPayment ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {processingPayment ? 'Processing...' : `Pay ${formatPrice(selectedProduct.price)}`}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  disabled={processingPayment}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: processingPayment ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {products.length === 0 ? (
          <p>No products found. Please check back later.</p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Product Image */}
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                  }}
                />
              )}

              {/* Product Info */}
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{product.title}</h3>
                <p style={{ color: '#6b7280', margin: '5px 0', fontSize: '14px' }}>
                  {product.category}
                </p>
                <p
                  style={{
                    color: '#374151',
                    fontSize: '12px',
                    margin: '8px 0',
                    maxHeight: '40px',
                    overflow: 'hidden',
                  }}
                >
                  {product.description}
                </p>

                {/* Price and Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                    {formatPrice(product.price)}
                  </span>
                  <button
                    onClick={() => handleBuy(product)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
