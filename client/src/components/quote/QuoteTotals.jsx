export default function QuoteTotals({ subtotal, taxRate, tax, total }) {
  return (
    <div className="flex justify-end mt-6">
      <div className="w-full sm:w-64 space-y-2">
        <div className="flex justify-between text-sm text-navy/70">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-navy/70">
          <span>Tax ({taxRate}%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-navy/10 pt-2 flex justify-between text-base font-semibold text-navy">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
