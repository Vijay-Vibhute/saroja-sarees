import React, { useState, useEffect } from 'react';
import { Product, products as defaultProducts } from '../data/products';

type ProductSourceMode = 'local' | 'sanity' | 'both';

interface AdminProductsProps {
  onLogout: () => void;
  productSourceMode: ProductSourceMode;
  onProductSourceChange: (mode: ProductSourceMode) => void;
  onProductsChange: (updatedProducts: Product[]) => void;
}

const PRODUCTS_STORAGE_KEY = 'store_products';

export default function AdminProducts({
  onLogout,
  productSourceMode,
  onProductSourceChange,
  onProductsChange,
}: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: { en: '', hi: '', mr: '' },
    desc: { en: '', hi: '', mr: '' },
  });
  const [message, setMessage] = useState('');
  const [imageError, setImageError] = useState(false);
  const [pendingProductSourceMode, setPendingProductSourceMode] =
    useState<ProductSourceMode>(productSourceMode);

  useEffect(() => {
    setPendingProductSourceMode(productSourceMode);
  }, [productSourceMode]);

  // Load products from localStorage or use defaults
  useEffect(() => {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    setProducts(stored ? JSON.parse(stored) : defaultProducts);
  }, []);

  // Save products to localStorage
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
    onProductsChange(updatedProducts);
  };

  const handleAddNew = () => {
    setFormData({
      id: `p_${Date.now()}`,
      price: 0,
      category: 'sarees',
      image: '',
      name: { en: '', hi: '', mr: '' },
      desc: { en: '', hi: '', mr: '' },
    });
    setImageError(false);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
    setImageError(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter((p) => p.id !== id);
      saveProducts(updated);
      showMessage('Product deleted successfully');
    }
  };

  const handleSave = () => {
    if (!formData.name?.en || !formData.price || formData.price <= 0) {
      showMessage('Please fill in all required fields (English name, price)', 'error');
      return;
    }

    if (editingId) {
      const updated = products.map((p) =>
        p.id === editingId ? { ...p, ...formData } : p
      );
      saveProducts(updated);
      showMessage('Product updated successfully');
    } else {
      const newProduct = formData as Product;
      saveProducts([...products, newProduct]);
      showMessage('Product added successfully');
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: { en: '', hi: '', mr: '' },
      desc: { en: '', hi: '', mr: '' },
    });
  };

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const sourceLabel =
    productSourceMode === 'sanity'
      ? 'Sanity only'
      : productSourceMode === 'local'
        ? 'Admin UI only'
        : 'Both sources';

  const sourceColor =
    productSourceMode === 'sanity'
      ? '#16a34a'
      : productSourceMode === 'local'
        ? '#2563eb'
        : '#7c3aed';

  const hasPendingSourceChange = pendingProductSourceMode !== productSourceMode;

  const handleApplySourceChange = () => {
    onProductSourceChange(pendingProductSourceMode);
    showMessage('Product source updated successfully');
  };

  const handleCancelSourceChange = () => {
    setPendingProductSourceMode(productSourceMode);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>Admin Dashboard - Product Management</h1>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Store Product Source</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="productSourceMode"
                checked={pendingProductSourceMode === 'sanity'}
                onChange={() => setPendingProductSourceMode('sanity')}
              />
              <span>Sanity only</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="productSourceMode"
                checked={pendingProductSourceMode === 'local'}
                onChange={() => setPendingProductSourceMode('local')}
              />
              <span>Admin UI only</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="productSourceMode"
                checked={pendingProductSourceMode === 'both'}
                onChange={() => setPendingProductSourceMode('both')}
              />
              <span>Both sources</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              onClick={handleApplySourceChange}
              disabled={!hasPendingSourceChange}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: hasPendingSourceChange ? 'pointer' : 'not-allowed',
                backgroundColor: hasPendingSourceChange ? '#16a34a' : '#9ca3af',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              Apply
            </button>
            <button
              onClick={handleCancelSourceChange}
              disabled={!hasPendingSourceChange}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: '1px solid #9ca3af',
                cursor: hasPendingSourceChange ? 'pointer' : 'not-allowed',
                backgroundColor: '#ffffff',
                color: '#111827',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: `1px solid ${sourceColor}`,
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '13px',
              color: sourceColor,
              fontWeight: 600,
            }}
          >
            Active Source: {sourceLabel}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '20px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderRadius: '4px',
              borderLeft: '4px solid #3b82f6',
            }}
          >
            {message}
          </div>
        )}

        {/* Add New Button */}
        {!showForm && (
          <button
            onClick={handleAddNew}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '20px',
            }}
          >
            + Add New Product
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              marginBottom: '30px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* ID (Read-only for new) */}
              {editingId && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={formData.id || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: '#f3f4f6',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* Price */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
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

              {/* Category */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Category
                </label>
                <select
                  value={formData.category || 'sarees'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as 'sarees' | 'innerwear',
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="sarees">Sarees</option>
                  <option value="innerwear">Innerwear</option>
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImageError(false);
                  }}
                  placeholder="https://..."
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

            {/* Image Preview */}
            {formData.image && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ marginBottom: '10px', fontWeight: '500' }}>Image Preview</p>
                {imageError && (
                  <p style={{ marginBottom: '8px', color: '#dc2626', fontSize: '13px' }}>
                    Could not load this image. Please check that the URL is correct and points to a
                    public JPG/PNG.
                  </p>
                )}
                <img
                  src={formData.image}
                  alt="preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                  }}
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            {/* Product Names */}
            <div style={{ marginTop: '20px' }}>
              <h3>Product Names *</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    English
                  </label>
                  <input
                    type="text"
                    value={formData.name?.en || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const current = formData.name || { en: '', hi: '', mr: '' };
                      setFormData({
                        ...formData,
                        name: {
                          en: value,
                          hi: current.hi || value,
                          mr: current.mr || value,
                        },
                      });
                    }}
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
                    हिंदी
                  </label>
                  <input
                    type="text"
                    value={formData.name?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { en: formData.name?.en || '', hi: e.target.value, mr: formData.name?.mr || '' },
                      })
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
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    मराठी
                  </label>
                  <input
                    type="text"
                    value={formData.name?.mr || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { en: formData.name?.en || '', hi: formData.name?.hi || '', mr: e.target.value },
                      })
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
            </div>

            {/* Product Descriptions */}
            <div style={{ marginTop: '20px' }}>
              <h3>Product Descriptions (Optional)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    English
                  </label>
                  <textarea
                    value={formData.desc?.en || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const current = formData.desc || {};
                      setFormData({
                        ...formData,
                        desc: {
                          ...current,
                          en: value,
                          hi: current.hi || value,
                          mr: current.mr || value,
                        },
                      });
                    }}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    हिंदी
                  </label>
                  <textarea
                    value={formData.desc?.hi || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        desc: { ...formData.desc, hi: e.target.value },
                      })
                    }
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    मराठी
                  </label>
                  <textarea
                    value={formData.desc?.mr || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        desc: { ...formData.desc, mr: e.target.value },
                      })
                    }
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Save Product
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: { en: '', hi: '', mr: '' },
                    desc: { en: '', hi: '', mr: '' },
                  });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        {!showForm && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Products ({products.length})</h2>
            {products.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No products yet. Add one to get started!</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {/* Product Image */}
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name.en}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                        }}
                      />
                    )}

                    {/* Product Info */}
                    <div style={{ padding: '15px' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                        {product.name.en}
                      </h3>
                      <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
                        <strong>ID:</strong> {product.id}
                      </p>
                      <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
                        <strong>Price:</strong> ₹{product.price}
                      </p>
                      <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
                        <strong>Category:</strong> {product.category}
                      </p>
                      {product.desc?.en && (
                        <p
                          style={{
                            margin: '10px 0',
                            color: '#6b7280',
                            fontSize: '13px',
                            maxHeight: '60px',
                            overflow: 'hidden',
                          }}
                        >
                          {product.desc.en}
                        </p>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
