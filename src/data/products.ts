export type Product = {
  id: string;
  price: number;
  image?: string;
  category: 'sarees' | 'innerwear';
  name: { en: string; hi: string; mr: string };
  desc?: { en?: string; hi?: string; mr?: string };
  gallery?: string[];
  videoUrl?: string;
};

export const CATEGORIES = {
  sarees: { en: 'Sarees', hi: 'साड़ियाँ', mr: 'साड्या' },
  innerwear: { en: 'Innerwear', hi: 'अंतर्वस्त्र', mr: 'अंतर्वस्त्रे' }
};

export const products: Product[] = [
  {
    id: 's1',
    price: 1299,
    category: 'sarees',
    image: 'https://dummyimage.com/400x500/dc2626/ffffff&text=Red+Silk+Saree',
    name: { en: 'Silk Saree - Red', hi: 'रेशमी साड़ी - लाल', mr: 'रेशमी साडी - लाल' },
    desc: {
      en: 'Elegant red silk saree, perfect for weddings and special occasions.',
      hi: 'शादी और समारोह के लिए उपयुक्त।',
      mr: 'समारोहांसाठी योग्य.'
    }
  },
  {
    id: 's2',
    price: 899,
    category: 'sarees',
    image: 'https://dummyimage.com/400x500/fecaca/374151&text=Pastel+Cotton+Saree',
    name: { en: 'Cotton Saree - Pastel', hi: 'कॉटन साड़ी - पेस्टल', mr: 'कापूस साडी - पेस्टल' },
    desc: {
      en: 'Comfortable pastel cotton saree for daily wear.',
      hi: 'दैनिक पहनने के लिए आरामदायक।',
      mr: 'दैनिक परिधानासाठी सुविधाजनक।'
    }
  },
  {
    id: 's3',
    price: 1099,
    category: 'sarees',
    image: 'https://dummyimage.com/400x500/fbbf24/78350f&text=Gold+Silk+Saree',
    name: { en: 'Silk Saree - Gold', hi: 'रेशमी साड़ी - सोना', mr: 'रेशमी साडी - सोना' },
    desc: {
      en: 'Luxurious golden silk saree with traditional designs.',
      hi: 'परंपरागत डिजाइन के साथ विलासी।',
      mr: 'परंपरागत डिজाइन सह.'
    }
  },
  {
    id: 'i1',
    price: 249,
    category: 'innerwear',
    image: 'https://dummyimage.com/400x500/f472b6/831843&text=Comfort+Bra',
    name: { en: 'Comfort Bra', hi: 'कम्फर्ट ब्रा', mr: 'कम्फर्ट ब्रा' },
    desc: {
      en: 'Comfortable and breathable support bra for everyday use.',
      hi: 'रोजमर्रा के लिए आरामदायक।',
      mr: 'दैनंदिन वापरासाठी आरामदायक।'
    }
  },
  {
    id: 'i2',
    price: 199,
    category: 'innerwear',
    image: 'https://dummyimage.com/400x500/e0e7ff/1e1b4b&text=Cotton+Innerwear+Set',
    name: { en: 'Cotton Innerwear Set', hi: 'कॉटन अंतर्वस्त्र सेट', mr: 'कापूस अंतर्वस्त्र सेट' },
    desc: {
      en: 'Soft cotton innerwear set for all-day freshness.',
      hi: 'पूरे दिन के लिए मुलायम।',
      mr: 'पूर्ण दिन कोमलता.'
    }
  },
  {
    id: 's4',
    price: 1150,
    category: 'sarees',
    image: 'https://dummyimage.com/400x500/b45309/fef3c7&text=Banarasi+Saree',
    name: { en: 'Banarasi Saree', hi: 'बनारसी साड़ी', mr: 'बनारसी साडी' },
    desc: {
      en: 'Traditional Banarasi saree with intricate zari work.',
      hi: 'पारंपरिक जरी काम के साथ।',
      mr: 'पारंपरिक जरी कार्य.'
    }
  }
];
