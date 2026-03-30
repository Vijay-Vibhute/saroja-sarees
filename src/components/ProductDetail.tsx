import React, {useState} from 'react'
import {Product} from '../data/products'

interface Props {
  product: Product
  products: Product[]
  onBack: () => void
  onAddToCart: (id: string) => void
  onBuyNow: (id: string) => void
}

export default function ProductDetail({product, products, onBack, onAddToCart, onBuyNow}: Props) {
  const [activeImage, setActiveImage] = useState<string | undefined>(product.image)

  const similar = products.filter(
    (p) => p.id !== product.id && p.category === product.category,
  ).slice(0, 4)

  const deliveryEstimate = '3-5 business days'
  const deliverable = true

  return (
    <div style={{padding: '16px'}}>
      <button
        onClick={onBack}
        style={{marginBottom: '16px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#2563eb'}}
      >
        ← Back to products
      </button>

      <div style={{display: 'flex', flexWrap: 'wrap', gap: '24px'}}>
        <div style={{flex: '1 1 280px', minWidth: '260px'}}>
          {activeImage && (
            <img
              src={activeImage}
              alt={product.name.en}
              style={{width: '100%', maxWidth: '400px', borderRadius: '8px', objectFit: 'cover'}}
            />
          )}

          {product.gallery && product.gallery.length > 0 && (
            <div style={{marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              {product.gallery.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt={product.name.en}
                  style={{width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: activeImage === url ? '2px solid #dc2626' : '1px solid #e5e7eb'}}
                  onClick={() => setActiveImage(url)}
                />
              ))}
            </div>
          )}

          {product.videoUrl && (
            <div style={{marginTop: '16px'}}>
              <h4 style={{margin: '8px 0'}}>Product video</h4>
              <video
                controls
                style={{width: '100%', maxWidth: '400px', borderRadius: '8px'}}
                src={product.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        <div style={{flex: '1 1 280px', minWidth: '260px'}}>
          <h2>{product.name.en}</h2>
          <p style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px'}}>₹{product.price}</p>

          {product.desc?.en && (
            <p style={{marginBottom: '12px'}}>{product.desc.en}</p>
          )}

          <div style={{display: 'flex', gap: '10px', marginBottom: '16px'}}>
            <button
              onClick={() => onAddToCart(product.id)}
              style={{padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#dc2626', color: 'white', cursor: 'pointer'}}
            >
              Add to cart
            </button>
            <button
              onClick={() => onBuyNow(product.id)}
              style={{padding: '8px 16px', borderRadius: '4px', border: '1px solid #dc2626', backgroundColor: 'white', color: '#dc2626', cursor: 'pointer'}}
            >
              Buy Now
            </button>
          </div>

          <div style={{marginBottom: '16px'}}>
            <h4 style={{margin: '8px 0'}}>Delivery</h4>
            <p style={{margin: 0}}>Estimate: {deliveryEstimate}</p>
            <p style={{margin: 0}}>Deliverable to your location: {deliverable ? 'Yes' : 'No'}</p>
          </div>

          <div style={{marginBottom: '16px'}}>
            <h4 style={{margin: '8px 0'}}>Offers</h4>
            <ul style={{paddingLeft: '20px', margin: 0}}>
              <li>10% off on prepaid orders</li>
              <li>Free shipping on orders above ₹999</li>
            </ul>
          </div>

          <div style={{marginBottom: '16px'}}>
            <h4 style={{margin: '8px 0'}}>Customer reviews</h4>
            <p style={{margin: 0, fontSize: '0.9rem', color: '#6b7280'}}>
              Reviews feature coming soon.
            </p>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div style={{marginTop: '32px'}}>
          <h3 style={{marginBottom: '12px'}}>Similar products</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}>
            {similar.map((p) => (
              <div key={p.id} style={{width: '160px'}}>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name.en}
                    style={{width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px'}}
                  />
                )}
                <div style={{fontSize: '0.9rem', marginTop: '4px'}}>{p.name.en}</div>
                <div style={{fontSize: '0.85rem', fontWeight: 600}}>₹{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
