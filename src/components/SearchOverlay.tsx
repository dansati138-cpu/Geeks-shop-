import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { products, categories, formatNaira, type Product } from '../data/products'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const popularSearches = ['Hoodie', 'Tee', 'Cargo', 'Windbreaker', 'Beanie', 'Cotton']

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory
      if (!q) return matchesCategory
      const matchesQuery =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory])

  const trending = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) return []
    if (activeCategory !== 'All') {
      return products.filter((p) => p.category === activeCategory).slice(0, 4)
    }
    return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4)
  }, [query, activeCategory])

  const categoryFilters = ['All', ...new Set(categories.map((c) => c.name))]

  if (!isOpen) return null

  return (
    <div className="search-overlay">
      <div className="search-backdrop" onClick={onClose} />
      <div className="search-panel">
        <div className="search-input-row">
          <span className="material-symbols-outlined search-input-icon">search</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search products, brands, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-close" onClick={onClose} aria-label="Close search">
            <span className="material-symbols-outlined">close</span>
            <span className="search-esc">ESC</span>
          </button>
        </div>

        <div className="search-filters">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              className={`search-filter-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-results">
          {query.trim() ? (
            <>
              <div className="search-results-header">
                <span className="search-results-count">
                  {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                  <strong>"{query.trim()}"</strong>
                </span>
              </div>

              {results.length > 0 ? (
                <div className="search-grid">
                  {results.map((product) => (
                    <SearchResultCard key={product.id} product={product} onClose={onClose} />
                  ))}
                </div>
              ) : (
                <div className="search-empty">
                  <span className="material-symbols-outlined">search_off</span>
                  <h3>No products found</h3>
                  <p>We couldn't find anything matching "{query.trim()}". Try a different search term or browse our categories.</p>
                  <button onClick={() => { setQuery(''); setActiveCategory('All') }}>
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="search-section">
                <span className="search-section-label">Popular Searches</span>
                <div className="search-popular">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      className="search-popular-pill"
                      onClick={() => setQuery(term)}
                    >
                      <span className="material-symbols-outlined">trending_up</span>
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="search-section">
                <span className="search-section-label">
                  {activeCategory === 'All' ? 'Trending Now' : `Top in ${activeCategory}`}
                </span>
                <div className="search-grid">
                  {trending.map((product) => (
                    <SearchResultCard key={product.id} product={product} onClose={onClose} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SearchResultCard({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <Link to={`/product/${product.id}`} className="search-result-card" onClick={onClose}>
      <div className="search-result-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
      </div>
      <div className="search-result-info">
        <span className="search-result-category">{product.category}</span>
        <h4 className="search-result-name">{product.name}</h4>
        <p className="search-result-desc">{product.description}</p>
        <div className="search-result-price">
          <span className="price-now">{formatNaira(product.price)}</span>
          {product.discountPrice && (
            <span className="price-was">{formatNaira(product.discountPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
