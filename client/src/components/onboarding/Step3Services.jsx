import { useState, useEffect, useMemo, useRef } from 'react';
import CustomSelect from '../CustomSelect.jsx';

const UNIT_OPTIONS = ['per hour', 'per sqft', 'per unit', 'per linear ft', 'per day', 'flat rate'];

function CategoryInput({ value, onChange, categories }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = categories.filter(c =>
    c.toLowerCase().includes((value || '').toLowerCase()) && c !== value
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Category (optional)"
        className="w-full h-8 px-3 rounded-md border border-navy/15 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 text-sm"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-navy/15 shadow-lg max-h-40 overflow-y-auto">
          {filtered.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => { onChange(cat); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-navy hover:bg-cream/80 transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg"
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step3Services({ services, onServicesChange }) {
  const [expandedId, setExpandedId] = useState(null);

  const updateService = (id, field, value) => {
    onServicesChange(services.map(s => s._tempId === id ? { ...s, [field]: value } : s));
  };

  const removeService = (id) => {
    onServicesChange(services.filter(s => s._tempId !== id));
  };

  // Group services by category
  const grouped = useMemo(() => {
    const groups = {};
    services.forEach(s => {
      const cat = s.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [services]);

  // Unique category names for the combobox
  const existingCategories = useMemo(() => {
    const cats = new Set();
    services.forEach(s => { if (s.category) cats.add(s.category); });
    return [...cats].sort();
  }, [services]);

  const addService = () => {
    onServicesChange([...services, {
      _tempId: crypto.randomUUID(),
      name: '',
      description: '',
      unit: 'flat rate',
      defaultPrice: 0,
      category: 'General',
    }]);
  };

  return (
    <div>
      <p className="text-sm text-navy/60 mb-4">
        We&apos;ve added common services for your business type. Edit prices, add, or remove as needed.
      </p>

      {grouped.map(([category, categoryServices]) => (
        <div key={category} className="mb-5">
          <h3 className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-2">
            {category}
          </h3>
          <div className="space-y-3">
            {categoryServices.map((service) => (
              <div
                key={service._tempId}
                className="bg-white border border-navy/10 rounded-xl p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(service._tempId, 'name', e.target.value)}
                      placeholder="Service name"
                      className="w-full text-base font-medium text-navy bg-transparent border-none outline-none placeholder:text-navy/30"
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-navy/40 text-sm">$</span>
                        <input
                          type="number"
                          value={service.defaultPrice || ''}
                          onChange={(e) => updateService(service._tempId, 'defaultPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-20 text-sm text-navy bg-cream/50 border border-navy/15 rounded-md px-2 h-8 outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                        />
                      </div>
                      <CustomSelect
                        value={service.unit}
                        onChange={(val) => updateService(service._tempId, 'unit', val)}
                        options={UNIT_OPTIONS}
                        className="h-8 w-28"
                      />
                    </div>
                    <div className="mt-2">
                      <CategoryInput
                        value={service.category}
                        onChange={(val) => updateService(service._tempId, 'category', val)}
                        categories={existingCategories}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(service._tempId)}
                    className="p-1.5 text-navy/25 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    aria-label="Remove service"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addService}
        className="mt-2 w-full h-12 rounded-xl border border-navy/15 text-navy/50 text-sm font-medium hover:border-gold hover:text-gold-dark transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        Add Service
      </button>

      {services.length === 0 && (
        <p className="text-center text-sm text-navy/40 mt-6">
          No services yet. Add at least one to continue.
        </p>
      )}
    </div>
  );
}
