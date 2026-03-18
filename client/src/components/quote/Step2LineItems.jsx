import LineItemCard from './LineItemCard.jsx';
import QuoteTotals from './QuoteTotals.jsx';

export default function Step2LineItems({
  lineItems, onLineItemsChange,
  notes, onNotesChange,
  terms, onTermsChange,
  subtotal, tax, taxRate, total,
  fallbackMode,
}) {
  const updateItem = (index, updated) => {
    const next = [...lineItems];
    next[index] = updated;
    onLineItemsChange(next);
  };

  const removeItem = (index) => {
    onLineItemsChange(lineItems.filter((_, i) => i !== index));
  };

  const moveItem = (index, direction) => {
    const next = [...lineItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onLineItemsChange(next);
  };

  const addItem = () => {
    onLineItemsChange([...lineItems, {
      _tempId: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unit: 'flat rate',
      unitPrice: 0,
      amount: 0,
    }]);
  };

  return (
    <div>
      {fallbackMode && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          AI couldn&apos;t generate items — add them manually below.
        </div>
      )}

      <div className="space-y-3">
        {lineItems.map((item, i) => (
          <LineItemCard
            key={item._tempId}
            item={item}
            index={i}
            totalCount={lineItems.length}
            onUpdate={updateItem}
            onRemove={removeItem}
            onMove={moveItem}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-4 w-full h-12 rounded-xl border border-navy/15 text-navy/50 text-sm font-medium hover:border-gold hover:text-gold-dark transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        Add Line Item
      </button>

      {lineItems.length === 0 && (
        <p className="text-center text-sm text-navy/40 mt-6">
          No line items yet. Add at least one to continue.
        </p>
      )}

      {/* Notes & Terms */}
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Additional notes for the client..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Terms & Conditions</label>
          <textarea
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            placeholder="Payment terms, warranty info, etc."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-sm resize-none"
          />
        </div>
      </div>

      <QuoteTotals subtotal={subtotal} taxRate={taxRate} tax={tax} total={total} />
    </div>
  );
}
