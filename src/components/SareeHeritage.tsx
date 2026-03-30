import React from 'react';

export default function SareeHeritage() {
  return (
    <section className="heritage-section">
      <div className="heritage-heading-row">
        <div>
          <p className="heritage-kicker">Heritage Collection</p>
          <h2 className="heritage-title">Timeless Story of Indian Sarees</h2>
        </div>
        <div className="heritage-tag">Curated by Saroja-Saree&apos;s</div>
      </div>
      <p className="heritage-intro">
        For centuries, sarees have been handwoven across India as a symbol of grace, culture and celebration.
        Each region has its own weave, motif and way of draping that tells a unique story.
      </p>
      <div className="heritage-grid">
        <div className="heritage-card">
          <div className="heritage-pill">North India</div>
          <h3>Banarasi Elegance</h3>
          <p>
            Woven in Varanasi with rich silk and zari, Banarasi sarees are known for their intricate
            floral motifs and Mughal-inspired patterns, often treasured as heirloom bridal pieces.
          </p>
        </div>
        <div className="heritage-card">
          <div className="heritage-pill">South India</div>
          <h3>Kanjeevaram Grandeur</h3>
          <p>
            From Tamil Nadu, Kanjeevaram sarees use heavy silk and bold temple borders, symbolising prosperity
            and traditionally worn for auspicious occasions and weddings.
          </p>
        </div>
        <div className="heritage-card">
          <div className="heritage-pill">Draping Styles</div>
          <h3>Nauvari & Draping Styles</h3>
          <p>
            The Marathi nauvari drape, Bengali style with keys at the waist, and Gujarati seedha pallu show
            how a single saree can be styled differently to match local traditions and everyday comfort.
          </p>
        </div>
      </div>
      <p className="heritage-note">
        At Saroja-Saree&apos;s we celebrate this heritage by curating pieces that blend traditional craftsmanship
        with modern comfort, so you can carry a piece of history in every drape.
      </p>
    </section>
  );
}
