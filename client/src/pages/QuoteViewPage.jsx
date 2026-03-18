import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Shared: mobile line item cards (all templates fall back to this on small screens)
function MobileLineItems({ items, brandColor }) {
  return (
    <div className="sm:hidden space-y-3 mb-6">
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: '#FAFAF8' }}>
          <p className="font-medium text-[#1B2A4A] text-sm mb-2">{item.description}</p>
          <p className="text-xs text-[#777] mb-1">{item.unit}</p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#999]">{item.quantity} &times; {formatCurrency(item.unitPrice)}</span>
            <span className="font-semibold text-[#1B2A4A]">{formatCurrency(item.amount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Shared: approve/decline action buttons
function ActionButtons({
  isActive, responding, error,
  showApproveConfirm, setShowApproveConfirm,
  showDeclineForm, setShowDeclineForm,
  declineReason, setDeclineReason,
  handleRespond,
}) {
  if (!isActive) return null;
  return (
    <div className="space-y-3 pt-5 mt-6 border-t border-[#f0f0f0]">
      {!showDeclineForm && !showApproveConfirm && (
        <button
          onClick={() => setShowApproveConfirm(true)}
          disabled={responding}
          className="w-full h-14 rounded-xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          Approve Quote
        </button>
      )}
      {showApproveConfirm && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-sm text-emerald-800 font-medium mb-3">
            This confirms you'd like to proceed with this quote. Continue?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond('approved')}
              disabled={responding}
              className="flex-1 h-12 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {responding ? <Spinner /> : 'Confirm'}
            </button>
            <button
              onClick={() => setShowApproveConfirm(false)}
              disabled={responding}
              className="h-12 px-5 rounded-lg border border-emerald-200 text-emerald-700 font-medium text-sm hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {!showApproveConfirm && !showDeclineForm && (
        <button
          onClick={() => setShowDeclineForm(true)}
          disabled={responding}
          className="w-full h-12 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Decline Quote
        </button>
      )}
      {showDeclineForm && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-800 font-medium mb-3">
            Let the business know why (optional):
          </p>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g. Price is too high, changed plans..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-red-200 bg-white text-sm text-[#1B2A4A] placeholder:text-[#1B2A4A]/30 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond('declined')}
              disabled={responding}
              className="flex-1 h-12 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {responding ? <Spinner /> : 'Confirm Decline'}
            </button>
            <button
              onClick={() => { setShowDeclineForm(false); setDeclineReason(''); }}
              disabled={responding}
              className="h-12 px-5 rounded-lg border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── CLEAN MINIMAL TEMPLATE ───
function CleanMinimalTemplate({ quote, business, brandColor, actionProps }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Accent line */}
      <div className="h-[3px]" style={{ backgroundColor: brandColor }} />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: brandColor }}>
              {business?.businessName || business?.name}
            </h1>
            <div className="text-[11px] text-[#777] mt-1 leading-relaxed">
              {business?.email && <p>{business.email}</p>}
              {business?.phone && <p>{business.phone}</p>}
              {business?.address && <p>{business.address}</p>}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[28px] font-light text-[#ccc] uppercase tracking-[2px]">Quote</p>
            <div className="text-[11px] text-[#777] mt-1.5 leading-loose">
              <p><strong className="text-[#1B2A4A]">#{quote.quoteNumber}</strong></p>
              <p>Date: {formatDate(quote.createdAt)}</p>
              {quote.expiresAt && <p>Valid until: {formatDate(quote.expiresAt)}</p>}
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="mb-7 px-5 py-4 rounded-md" style={{ backgroundColor: '#FAFAF8' }}>
          <p className="text-[10px] uppercase tracking-[1px] text-[#999] font-semibold mb-1.5">Prepared for</p>
          <p className="text-[15px] font-semibold text-[#1B2A4A]">{quote.clientName}</p>
          <p className="text-[11px] text-[#777] mt-0.5">
            {quote.clientEmail}{quote.clientEmail && quote.clientPhone && ' '}{quote.clientPhone}
          </p>
        </div>

        {/* Table — desktop */}
        <div className="hidden sm:block mb-6">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${brandColor}` }}>
                <th className="text-left text-[10px] uppercase tracking-wider text-[#999] font-semibold pb-2.5 pr-2" style={{ width: '45%' }}>Description</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#999] font-semibold pb-2.5 px-2" style={{ width: '10%' }}>Qty</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#999] font-semibold pb-2.5 px-2" style={{ width: '15%' }}>Unit</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#999] font-semibold pb-2.5 px-2" style={{ width: '15%' }}>Unit Price</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#999] font-semibold pb-2.5 pl-2" style={{ width: '15%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, i) => (
                <tr key={i} className="border-b border-[#f0f0f0]">
                  <td className="py-2.5 pr-2 text-xs text-[#1B2A4A]">{item.description}</td>
                  <td className="py-2.5 px-2 text-right text-xs text-[#1B2A4A]">{item.quantity}</td>
                  <td className="py-2.5 px-2 text-right text-[11px] text-[#999]">{item.unit}</td>
                  <td className="py-2.5 px-2 text-right text-xs text-[#1B2A4A]">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2.5 pl-2 text-right text-xs text-[#1B2A4A]">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <MobileLineItems items={quote.lineItems} brandColor={brandColor} />

        {/* Totals */}
        <div className="flex justify-end mb-7">
          <div className="w-56">
            <div className="flex justify-between py-1.5 text-xs text-[#777]">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.taxRate > 0 && (
              <div className="flex justify-between py-1.5 text-xs text-[#777]">
                <span>Tax ({quote.taxRate}%)</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
            )}
            <div
              className="flex justify-between pt-2.5 mt-1 text-base font-bold text-[#1B2A4A]"
              style={{ borderTop: `2px solid ${brandColor}` }}
            >
              <span>Total</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mb-6 px-5 py-4 rounded-md" style={{ backgroundColor: '#FAFAF8' }}>
            <p className="text-[10px] uppercase tracking-[1px] text-[#999] font-semibold mb-2">Notes & Terms</p>
            <p className="text-xs text-[#555] leading-relaxed whitespace-pre-line">{quote.notes}</p>
          </div>
        )}

        <ActionButtons {...actionProps} />
      </div>
    </div>
  );
}

// ─── BOLD MODERN TEMPLATE ───
function BoldModernTemplate({ quote, business, brandColor, actionProps }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#e8e8e8]">
      {/* Full-width brand header */}
      <div className="px-6 sm:px-9 py-7 sm:py-8 text-white" style={{ backgroundColor: brandColor }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{business?.businessName || business?.name}</h1>
            <div className="text-[11px] opacity-80 mt-1 leading-relaxed">
              {business?.email && <p>{business.email}</p>}
              {business?.phone && <p>{business.phone}</p>}
              {business?.address && <p>{business.address}</p>}
            </div>
          </div>
          <div className="px-5 py-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <p className="text-[10px] uppercase tracking-[1.5px] opacity-70">Quote</p>
            <p className="text-[22px] font-bold">#{quote.quoteNumber}</p>
            <p className="text-[11px] opacity-70 mt-1">{formatDate(quote.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-9 py-7 sm:py-8">
        {/* Client row */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-7 pb-5 border-b border-[#f0f0f0]">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[1px] text-[#999] font-semibold mb-1.5">Prepared for</p>
            <p className="text-[15px] font-semibold text-[#1B2A4A]">{quote.clientName}</p>
            <p className="text-[11px] text-[#777] mt-0.5">
              {quote.clientEmail}
              {quote.clientPhone && <><br />{quote.clientPhone}</>}
            </p>
          </div>
          {quote.expiresAt && (
            <div>
              <p className="text-[10px] uppercase tracking-[1px] text-[#999] font-semibold mb-1.5">Valid until</p>
              <p className="text-[13px] font-medium text-[#1B2A4A]">{formatDate(quote.expiresAt)}</p>
            </div>
          )}
        </div>

        {/* Table — desktop */}
        <div className="hidden sm:block mb-6">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="text-left text-[10px] uppercase tracking-wider text-white font-semibold px-3 py-2.5 rounded-tl-md" style={{ backgroundColor: brandColor, width: '45%' }}>Description</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-white font-semibold px-3 py-2.5" style={{ backgroundColor: brandColor, width: '10%' }}>Qty</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-white font-semibold px-3 py-2.5" style={{ backgroundColor: brandColor, width: '15%' }}>Unit Price</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-white font-semibold px-3 py-2.5 rounded-tr-md" style={{ backgroundColor: brandColor, width: '15%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, i) => (
                <tr key={i} className="border-b border-[#f5f5f5]" style={{ backgroundColor: i % 2 === 1 ? '#FAFAF8' : 'transparent' }}>
                  <td className="py-2.5 px-3 text-xs text-[#1B2A4A]">
                    {item.description}
                    <br /><span className="text-[11px] text-[#999]">{item.unit}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-xs text-[#1B2A4A]">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-xs text-[#1B2A4A]">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right text-xs text-[#1B2A4A]">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <MobileLineItems items={quote.lineItems} brandColor={brandColor} />

        {/* Totals */}
        <div className="flex justify-end mb-7">
          <div className="w-60">
            <div className="flex justify-between py-1.5 px-3 text-xs text-[#777]">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.taxRate > 0 && (
              <div className="flex justify-between py-1.5 px-3 text-xs text-[#777]">
                <span>Tax ({quote.taxRate}%)</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
            )}
            <div
              className="flex justify-between py-2.5 px-3 mt-1.5 rounded-md text-base font-bold text-white"
              style={{ backgroundColor: brandColor }}
            >
              <span>Total</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[1px] text-[#999] font-semibold mb-2">Notes & Terms</p>
            <div
              className="text-xs text-[#555] leading-relaxed whitespace-pre-line px-4 py-3 rounded-lg"
              style={{ backgroundColor: '#F8F8F6', borderLeft: `3px solid ${brandColor}` }}
            >
              {quote.notes}
            </div>
          </div>
        )}

        <ActionButtons {...actionProps} />
      </div>
    </div>
  );
}

// ─── CLASSIC PROFESSIONAL TEMPLATE ───
function ClassicProfessionalTemplate({ quote, business, brandColor, actionProps }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 sm:p-8">
        {/* Header with brand-colored bottom border */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-5 mb-7" style={{ borderBottom: `2px solid ${brandColor}` }}>
          <div>
            <h1 className="font-display text-[26px] font-bold" style={{ color: brandColor }}>
              {business?.businessName || business?.name}
            </h1>
            <div className="text-[11px] text-[#666] mt-1.5 leading-relaxed">
              {business?.email && <p>{business.email}</p>}
              {business?.phone && <p>{business.phone}</p>}
              {business?.address && <p>{business.address}</p>}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="font-display text-[32px] font-normal tracking-[1px]" style={{ color: brandColor }}>Quote</p>
            <div className="text-[11px] text-[#666] mt-2 leading-loose">
              <p>Number: <strong className="text-[#1B2A4A]">#{quote.quoteNumber}</strong></p>
              <p>Date: {formatDate(quote.createdAt)}</p>
              {quote.expiresAt && <p>Valid until: {formatDate(quote.expiresAt)}</p>}
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="mb-7">
          <p className="text-[10px] uppercase tracking-[1.5px] text-[#999] font-semibold mb-2">Prepared for</p>
          <p className="font-display text-base font-semibold text-[#1B2A4A]">{quote.clientName}</p>
          <p className="text-xs text-[#666] mt-0.5">
            {quote.clientEmail}{quote.clientEmail && quote.clientPhone && ' \u2022 '}{quote.clientPhone}
          </p>
        </div>

        {/* Table — desktop */}
        <div className="hidden sm:block mb-6">
          <table className="w-full border border-[#ddd]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F3F0' }}>
                <th className="text-left text-[10px] uppercase tracking-wider text-[#1B2A4A] font-bold px-3 py-2.5 border border-[#ddd]" style={{ width: '40%' }}>Description</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#1B2A4A] font-bold px-3 py-2.5 border border-[#ddd]" style={{ width: '8%' }}>Qty</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#1B2A4A] font-bold px-3 py-2.5 border border-[#ddd]" style={{ width: '15%' }}>Unit</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#1B2A4A] font-bold px-3 py-2.5 border border-[#ddd]" style={{ width: '17%' }}>Unit Price</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#1B2A4A] font-bold px-3 py-2.5 border border-[#ddd]" style={{ width: '17%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, i) => (
                <tr key={i} className="border border-[#ddd]" style={{ backgroundColor: i % 2 === 1 ? '#F9F8F5' : 'transparent' }}>
                  <td className="py-2.5 px-3 text-xs text-[#1B2A4A] border border-[#ddd]">{item.description}</td>
                  <td className="py-2.5 px-3 text-right text-xs text-[#1B2A4A] border border-[#ddd]">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-[11px] text-[#888] border border-[#ddd]">{item.unit}</td>
                  <td className="py-2.5 px-3 text-right text-xs text-[#1B2A4A] border border-[#ddd]">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right text-xs text-[#1B2A4A] border border-[#ddd]">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <MobileLineItems items={quote.lineItems} brandColor={brandColor} />

        {/* Totals */}
        <div className="flex justify-end mb-7">
          <div className="w-60">
            <div className="flex justify-between py-1.5 text-xs text-[#666] border-b border-[#eee]">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.taxRate > 0 && (
              <div className="flex justify-between py-1.5 text-xs text-[#666] border-b border-[#eee]">
                <span>Tax ({quote.taxRate}%)</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
            )}
            <div
              className="flex justify-between pt-2.5 mt-1 text-[17px] font-bold text-[#1B2A4A]"
              style={{ borderTop: `2px solid ${brandColor}` }}
            >
              <span>Total Due</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Decorative separator */}
        <hr className="border-[#ddd] mb-6" />

        {/* Notes */}
        {quote.notes && (
          <div className="mb-6 p-4 rounded border border-[#e8e8e8]">
            <p className="text-[10px] uppercase tracking-[1.5px] text-[#999] font-semibold mb-2">Notes & Terms</p>
            <p className="text-xs text-[#555] leading-relaxed whitespace-pre-line">{quote.notes}</p>
          </div>
        )}

        <ActionButtons {...actionProps} />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───
export default function QuoteViewPage() {
  const { shareToken } = useParams();

  const [quote, setQuote] = useState(null);
  const [business, setBusiness] = useState(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [responding, setResponding] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [responseComplete, setResponseComplete] = useState(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/quotes/share/${shareToken}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Quote not found');
      }
      const data = await res.json();
      setQuote(data.quote);
      setBusiness(data.business);
      setExpired(data.expired);
    } catch (err) {
      setError(err.message || 'Failed to load quote');
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  const handleRespond = async (response) => {
    setResponding(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes/share/${shareToken}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response,
          ...(response === 'declined' && declineReason.trim() && { reason: declineReason.trim() }),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to respond');
      }
      setResponseComplete(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setResponding(false);
    }
  };

  const brandColor = business?.brandColor || '#1B2A4A';

  // -- Loading --
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-navy/30" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-navy/40 text-sm">Loading quote...</p>
        </div>
      </div>
    );
  }

  // -- Error --
  if (error && !quote) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-red-400">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-navy font-medium mb-2">Unable to load quote</p>
          <p className="text-navy/50 text-sm mb-6">{error}</p>
          <button
            onClick={fetchQuote}
            className="h-11 px-6 rounded-lg bg-navy text-white font-medium text-sm hover:bg-navy-light transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // -- Response Complete --
  if (responseComplete) {
    const isApproved = responseComplete === 'approved';
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: isApproved ? '#f0fdf4' : '#fef2f2' }}
          >
            {isApproved ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </div>
          <h1 className="font-display text-2xl text-navy mb-2">
            {isApproved ? 'Quote Approved' : 'Quote Declined'}
          </h1>
          <p className="text-navy/50 text-sm leading-relaxed">
            Thank you for your response. {business?.businessName || 'The business owner'} has been notified.
          </p>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  const alreadyResponded = quote.respondedAt && (quote.status === 'approved' || quote.status === 'declined');
  const isActive = !expired && !alreadyResponded;
  const templateStyle = business?.templateStyle || 'clean-minimal';

  const actionProps = {
    isActive, responding, error,
    showApproveConfirm, setShowApproveConfirm,
    showDeclineForm, setShowDeclineForm,
    declineReason, setDeclineReason,
    handleRespond,
  };

  const TemplateComponent =
    templateStyle === 'bold-modern' ? BoldModernTemplate :
    templateStyle === 'classic-professional' ? ClassicProfessionalTemplate :
    CleanMinimalTemplate;

  return (
    <div className="min-h-screen bg-cream px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Status Banners */}
        {expired && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>This quote expired on {formatDate(quote.expiresAt)}.</span>
          </div>
        )}

        {alreadyResponded && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-3"
            style={{
              backgroundColor: quote.status === 'approved' ? '#f0fdf4' : '#fef2f2',
              borderColor: quote.status === 'approved' ? '#bbf7d0' : '#fecaca',
              borderWidth: '1px',
              borderStyle: 'solid',
              color: quote.status === 'approved' ? '#166534' : '#991b1b',
            }}
          >
            {quote.status === 'approved' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            )}
            <span>
              You {quote.status} this quote on {formatDate(quote.respondedAt)}.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <TemplateComponent
          quote={quote}
          business={business}
          brandColor={brandColor}
          actionProps={actionProps}
        />

        {/* Footer */}
        <p className="text-center text-xs text-navy/25 mt-6">
          Powered by QuoteFast
        </p>
      </div>
    </div>
  );
}
