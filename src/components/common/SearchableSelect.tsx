import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  description?: string;
}

interface SearchableSelectProps {
  options: (string | SelectOption)[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  isMulti?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  isMulti = false,
  allowCustom = true,
  customPlaceholder = 'Specify custom option...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption format
  const normalizedOptions: SelectOption[] = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Group options if groups exist
  const groupedOptions: Record<string, SelectOption[]> = {};
  normalizedOptions.forEach(opt => {
    const group = opt.group || 'Standard Options';
    if (!groupedOptions[group]) groupedOptions[group] = [];
    groupedOptions[group].push(opt);
  });

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue: string) => {
    if (optValue === 'CUSTOM_OTHER') {
      setIsCustomMode(true);
      return;
    }

    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optValue)) {
        onChange(currentValues.filter(v => v !== optValue));
      } else {
        onChange([...currentValues, optValue]);
      }
    } else {
      onChange(optValue);
      setIsCustomMode(false);
      setIsOpen(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customValue.trim()) return;
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange([...currentValues, customValue.trim()]);
    } else {
      onChange(customValue.trim());
    }
    setCustomValue('');
    setIsCustomMode(false);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.length === 0) return placeholder;
      return `${currentValues.length} selected`;
    }
    if (!value) return placeholder;
    const found = normalizedOptions.find(o => o.value === value);
    return found ? found.label : String(value);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}

      {isCustomMode ? (
        <form onSubmit={handleCustomSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            autoFocus
            value={customValue}
            onChange={e => setCustomValue(e.target.value)}
            placeholder={customPlaceholder}
            className="flex-1 px-3 py-2 border border-blue-500 rounded-lg text-sm bg-blue-50/20 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsCustomMode(false)}
            className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white flex items-center justify-between cursor-pointer hover:border-slate-400 transition min-h-[38px]"
        >
          <div className="flex flex-wrap gap-1 items-center max-w-[90%] overflow-hidden">
            {isMulti && Array.isArray(value) && value.length > 0 ? (
              value.map(val => {
                const opt = normalizedOptions.find(o => o.value === val);
                return (
                  <span
                    key={val}
                    className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 border border-blue-200"
                  >
                    {opt ? opt.label : val}
                    <X
                      className="w-3 h-3 hover:text-blue-900 cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        handleSelect(val);
                      }}
                    />
                  </span>
                );
              })
            ) : (
              <span className={`text-sm ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                {getDisplayLabel()}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      )}

      {isOpen && !isCustomMode && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search options..."
              className="w-full bg-transparent text-xs text-slate-800 outline-none"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-1 space-y-1 divide-y divide-slate-100 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs">No matching options found</div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = isMulti
                  ? Array.isArray(value) && value.includes(opt.value)
                  : value === opt.value;

                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition ${
                      isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div>{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-slate-400 font-normal">{opt.description}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                );
              })
            )}

            {allowCustom && (
              <div
                onClick={() => handleSelect('CUSTOM_OTHER')}
                className="p-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg cursor-pointer border-t border-slate-100 flex items-center justify-between"
              >
                <span>+ Custom / Other</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
