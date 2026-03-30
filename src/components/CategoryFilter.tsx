import React from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../data/products';

type Props = {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
};

export default function CategoryFilter({ selectedCategory, onCategoryChange }: Props) {
  const { i18n } = useTranslation();

  return (
    <div className="category-filter-sidebar">
      <h3 className="filter-title">🏷️ Categories</h3>
      <div className="category-list">
        <button
          className={`category-item ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onCategoryChange(null)}
        >
          All Products
        </button>
        {Object.entries(CATEGORIES).map(([key, labels]) => (
          <button
            key={key}
            className={`category-item ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => onCategoryChange(key)}
          >
            {labels[i18n.language as 'en' | 'hi' | 'mr'] || labels.en}
          </button>
        ))}
      </div>
    </div>
  );
}

