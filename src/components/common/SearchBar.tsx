import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles, Tag, ShieldCheck, Trash2 } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { LumoLoader } from './LumoLoader';

interface SearchBarProps {
  initialQuery?: string;
  onSearchSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = '', onSearchSubmit }) => {
  const { catalogProducts, catalogCategories, catalogBrands } = useCatalog();

  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lumo_recent_searches');
      return saved ? JSON.parse(saved) : ['Samsung Galaxy A55', 'Oraimo FreePods', 'Smart TV 55'];
    } catch {
      return ['Samsung Galaxy A55', 'Oraimo FreePods', 'Smart TV 55'];
    }
  });

  const [backendSuggestions, setBackendSuggestions] = useState<{
    products: any[];
    categories: any[];
    brands: any[];
  }>({ products: [], categories: [], brands: [] });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const trendingSearches = [
    'Samsung Galaxy A55',
    'Oraimo FreePods 4',
    'Smart TV 55',
    'Airfryer Philips',
    'Nike Air Max',
    'Kilombero Rice',
  ];

  // Fetch live autocomplete from backend with debouncing
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setBackendSuggestions({ products: [], categories: [], brands: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setBackendSuggestions({
            products: data.products || [],
            categories: data.categories || [],
            brands: data.brands || []
          });
        } else {
          setBackendSuggestions({ products: [], categories: [], brands: [] });
        }
      } catch {
        setBackendSuggestions({ products: [], categories: [], brands: [] });
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('lumo_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('lumo_recent_searches');
    } catch {}
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    saveRecentSearch(searchQuery.trim());
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    onSearchSubmit?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Keyboard navigation
  const allSelectableItems = React.useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const items: Array<{ type: 'category' | 'brand' | 'product' | 'viewAll'; data: any }> = [];
    (backendSuggestions.categories || []).forEach(c => items.push({ type: 'category', data: c }));
    (backendSuggestions.brands || []).forEach(b => items.push({ type: 'brand', data: b }));
    (backendSuggestions.products || []).forEach(p => items.push({ type: 'product', data: p }));
    items.push({ type: 'viewAll', data: query });
    return items;
  }, [query, backendSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allSelectableItems.length === 0) {
      if (e.key === 'Escape') setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % allSelectableItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? allSelectableItems.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < allSelectableItems.length) {
      e.preventDefault();
      const selected = allSelectableItems[activeIndex];
      if (selected.type === 'category') {
        setIsOpen(false);
        navigate(`/category/${selected.data.slug}`);
      } else if (selected.type === 'brand') {
        setIsOpen(false);
        navigate(`/brand/${selected.data.slug}`);
      } else if (selected.type === 'product') {
        setIsOpen(false);
        navigate(`/products/${selected.data.id}`);
      } else {
        handleSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative w-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands and categories in Tanzania..."
            className="w-full pl-4 pr-28 py-2.5 sm:py-3 bg-neutral-100 focus:bg-white text-neutral-900 placeholder:text-neutral-500 border-2 border-transparent focus:border-[#FF6A00] rounded-xl text-sm outline-hidden transition-all shadow-inner"
          />

          {loading && (
            <div className="absolute right-24 text-[#FF6A00]">
              <LumoLoader size="small" />
            </div>
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-24 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="absolute right-1 px-4 py-1.5 sm:py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50 text-xs sm:text-sm animate-in fade-in">
          {query.trim().length >= 2 ? (
            <div className="py-2 divide-y divide-neutral-100">
              {/* Matched Categories & Brands */}
              {((backendSuggestions.categories?.length || 0) > 0 || (backendSuggestions.brands?.length || 0) > 0) && (
                <div className="p-2.5 bg-neutral-50 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Direct Matches:</span>
                  {(backendSuggestions.categories || []).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        saveRecentSearch(c.name);
                        setIsOpen(false);
                        navigate(`/category/${c.slug}`);
                      }}
                      className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-[#FF6A00] hover:text-[#FF6A00] rounded-lg font-medium text-xs text-neutral-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Tag size={11} className="text-[#FF6A00]" />
                      <span>Category:</span> <strong>{c.name}</strong>
                    </button>
                  ))}
                  {(backendSuggestions.brands || []).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        saveRecentSearch(b.name);
                        setIsOpen(false);
                        navigate(`/brand/${b.slug}`);
                      }}
                      className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-[#FF6A00] hover:text-[#FF6A00] rounded-lg font-medium text-xs text-neutral-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <ShieldCheck size={11} className="text-blue-600" />
                      <span>Brand:</span> <strong>{b.name}</strong> (Official)
                    </button>
                  ))}
                </div>
              )}

              {/* Matched Products */}
              {(backendSuggestions.products?.length || 0) > 0 ? (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Suggested Products</span>
                    <span className="text-[10px] text-neutral-400 font-normal">Use &uarr; &darr; to navigate</span>
                  </div>
                  {(backendSuggestions.products || []).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        saveRecentSearch(p.name);
                        setIsOpen(false);
                        navigate(`/products/${p.id}`);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-orange-50/60 focus:bg-orange-50/60 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.thumbnail || null}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-neutral-100 shrink-0 bg-neutral-50"
                        />
                        <div className="truncate">
                          <p className="font-medium text-neutral-800 group-hover:text-[#FF6A00] truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                            <span>{p.brand}</span>
                            <span>•</span>
                            <span className="capitalize">{p?.category || 'General'}</span>
                            {p.stock <= 5 && (
                              <span className="text-amber-600 font-medium bg-amber-50 px-1.5 py-0.2 rounded text-[10px]">
                                Low stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-bold text-[#FF6A00] text-xs block">
                          TZS {(Number(p.price) || 0).toLocaleString()}
                        </span>
                        {p.oldPrice && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            TZS {(Number(p.oldPrice) || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="p-4 text-center text-neutral-500 text-xs">
                    No product matches found for &quot;{query}&quot;. Press enter to search all catalog items.
                  </div>
                )
              )}

              {/* View all search results button */}
              <button
                onClick={() => handleSearch(query)}
                className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-[#FF6A00] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border-t border-neutral-100"
              >
                <span>View all results for &quot;{query}&quot;</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Recent searches if any */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-neutral-500" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-neutral-400 hover:text-red-600 transition flex items-center gap-1 normal-case font-normal"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(term)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-orange-50 hover:text-[#FF6A00] hover:border-orange-200 border border-transparent rounded-lg text-xs font-medium text-neutral-700 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Clock size={11} className="text-neutral-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending searches in Tanzania */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  <TrendingUp size={13} className="text-[#FF6A00]" />
                  <span>Trending Searches in Tanzania</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trendingSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-orange-50 hover:text-[#FF6A00] hover:border-orange-200 border border-transparent rounded-lg text-xs font-medium text-neutral-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles size={11} className="text-[#FF6A00]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
