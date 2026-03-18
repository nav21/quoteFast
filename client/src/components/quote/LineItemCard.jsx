import CustomSelect from '../CustomSelect.jsx';

const UNIT_OPTIONS = ['per hour', 'per sqft', 'per unit', 'per linear ft', 'per day', 'flat rate'];

export default function LineItemCard({ item, index, totalCount, onUpdate, onRemove, onMove }) {
  const handleFieldChange = (field, value) => {
    const updated = { ...item, [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
    }
    onUpdate(index, updated);
  };

  return (
    <div className="bg-white border border-navy/10 rounded-xl p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Description */}
          <input
            type="text"
            value={item.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Line item description"
            className="w-full text-base font-medium text-navy bg-transparent border-none outline-none placeholder:text-navy/30"
          />

          {/* Qty, Unit Price, Unit, Total — wraps on mobile */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-navy/40 shrink-0">Qty</label>
              <input
                type="number"
                value={item.quantity || ''}
                onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                className="w-16 text-sm text-navy bg-cream/50 border border-navy/15 rounded-md px-2 h-8 outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-navy/40 shrink-0">Price</label>
              <div className="flex items-center gap-0.5">
                <span className="text-navy/40 text-sm">$</span>
                <input
                  type="number"
                  value={item.unitPrice || ''}
                  onChange={(e) => handleFieldChange('unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-24 text-sm text-navy bg-cream/50 border border-navy/15 rounded-md px-2 h-8 outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                />
              </div>
            </div>

            <CustomSelect
              value={item.unit || 'flat rate'}
              onChange={(val) => handleFieldChange('unit', val)}
              options={UNIT_OPTIONS}
              className="h-8 w-28"
            />

            <span className="text-sm font-semibold text-navy ml-auto whitespace-nowrap">
              ${(item.amount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions: move up/down + delete */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="p-1 text-navy/25 hover:text-navy/60 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 'down')}
            disabled={index === totalCount - 1}
            className="p-1 text-navy/25 hover:text-navy/60 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 text-navy/25 hover:text-red-500 transition-colors cursor-pointer mt-1"
            aria-label="Remove item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
