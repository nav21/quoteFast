import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import Step2LineItems from '../components/quote/Step2LineItems.jsx';

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600',
  ready: 'bg-purple-100 text-purple-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
  expired: 'bg-orange-100 text-orange-700',
};

const STATUS_BANNERS = {
  ready: { bg: 'bg-purple-50 border-purple-200 text-purple-700', text: 'Quote is ready to send. Share the link with your client.' },
  sent: { bg: 'bg-blue-50 border-blue-200 text-blue-700', text: 'Quote sent. Waiting for client response.' },
  viewed: { bg: 'bg-amber-50 border-amber-200 text-amber-700', text: 'Client has viewed this quote.' },
  approved: { bg: 'bg-green-50 border-green-200 text-green-700', text: 'Client approved this quote.' },
  declined: { bg: 'bg-red-50 border-red-200 text-red-600', text: 'Client declined this quote.' },
  expired: { bg: 'bg-orange-50 border-orange-200 text-orange-700', text: 'This quote has expired.' },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDisplayStatus(quote) {
  if (quote.expiresAt && new Date(quote.expiresAt) < new Date() && (quote.status === 'ready' || quote.status === 'sent' || quote.status === 'viewed')) {
    return 'expired';
  }
  return quote.status;
}

function splitNotes(raw) {
  if (!raw) return { notes: '', terms: '' };
  const sep = '\n\n---\nTerms & Conditions:\n';
  const idx = raw.indexOf(sep);
  if (idx === -1) return { notes: raw, terms: '' };
  return { notes: raw.slice(0, idx), terms: raw.slice(idx + sep.length) };
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Editable state (drafts only)
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    api.fetch(`/api/quotes/${id}`)
      .then(data => {
        const q = data.quote || data;
        setQuote(q);
        // Initialize edit state
        setClientName(q.clientName || '');
        setClientEmail(q.clientEmail || '');
        setClientPhone(q.clientPhone || '');
        setLineItems((q.lineItems || []).map(item => ({ ...item, _tempId: crypto.randomUUID() })));
        const { notes: n, terms: t } = splitNotes(q.notes || '');
        setNotes(n);
        setTerms(t);
        setTaxRate(q.taxRate || 0);
        setJobDescription(q.jobDescription || '');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-dismiss success message
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const t = Math.round(sub * taxRate) / 100;
    return { subtotal: sub, tax: t, total: sub + t };
  }, [lineItems, taxRate]);

  const isDraft = quote?.status === 'draft';
  const displayStatus = quote ? getDisplayStatus(quote) : 'draft';
  const banner = STATUS_BANNERS[displayStatus];

  const shareUrl = quote?.shareToken ? `${window.location.origin}/quote/${quote.shareToken}` : '';

  const buildPayload = (status) => {
    const combinedNotes = [notes, terms].filter(Boolean).join('\n\n---\nTerms & Conditions:\n');
    return {
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      jobDescription: jobDescription.trim(),
      lineItems: lineItems.map(({ _tempId, ...rest }) => rest),
      subtotal,
      tax,
      taxRate,
      total,
      notes: combinedNotes,
      status,
    };
  };

  const handleSaveDraft = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const updated = await api.fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(buildPayload('draft')),
      });
      setQuote(updated.quote || updated);
      setSuccess('Draft saved successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSent = async (action) => {
    setError('');
    if (lineItems.length === 0) {
      setError('Add at least one line item before sending.');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(buildPayload('ready')),
      });
      const q = updated.quote || updated;
      setQuote(q);

      if (action === 'copy' && q.shareToken) {
        const url = `${window.location.origin}/quote/${q.shareToken}`;
        try { await navigator.clipboard.writeText(url); } catch { window.prompt('Copy this link:', url); }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { window.prompt('Copy this link:', shareUrl); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setError('');
    setDownloadingPdf(true);
    try {
      // Save current edits first so PDF reflects latest changes
      if (isDraft) {
        const updated = await api.fetch(`/api/quotes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(buildPayload('draft')),
        });
        setQuote(updated.quote || updated);
      }
      const resp = await api.fetchRaw(`/api/quotes/${id}/pdf`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `quote-${quote.quoteNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message || 'Failed to download PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-navy/10 rounded-full" />
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="h-5 w-48 bg-navy/10 rounded-full" />
            <div className="h-4 w-64 bg-navy/10 rounded-full" />
            <div className="h-4 w-40 bg-navy/10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (!quote) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-navy/50 mb-4">{error || 'Quote not found.'}</p>
        <Link to="/dashboard" className="text-gold-dark font-medium text-sm hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 -ml-2 text-navy/40 hover:text-navy transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl text-navy">Quote #{quote.quoteNumber}</h1>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[displayStatus] || STATUS_STYLES.draft}`}>
              {displayStatus}
            </span>
          </div>
          <p className="text-xs text-navy/40 mt-0.5">
            Created {formatDate(quote.createdAt)}
            {quote.expiresAt && <> &middot; Expires {formatDate(quote.expiresAt)}</>}
          </p>
        </div>
        <p className="text-xl font-bold text-navy shrink-0">{formatCurrency(isDraft ? total : (quote.total || 0))}</p>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2.5 animate-[selectSlide_200ms_ease-out]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Status banner for non-draft */}
      {!isDraft && banner && (
        <div className={`mb-5 px-4 py-3 rounded-lg border text-sm ${banner.bg}`}>
          {banner.text}
          {displayStatus === 'viewed' && quote.viewedAt && ` (${formatDate(quote.viewedAt)})`}
          {(displayStatus === 'approved' || displayStatus === 'declined') && quote.respondedAt && ` (${formatDate(quote.respondedAt)})`}
          {displayStatus === 'expired' && quote.expiresAt && ` (${formatDate(quote.expiresAt)})`}
        </div>
      )}

      {/* DRAFT: Editable form */}
      {isDraft ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Client info */}
          <h2 className="font-display text-lg text-navy mb-4">Client Details</h2>
          <div className="space-y-3 mb-8">
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Client name"
              className="w-full h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
            />
            <div className="flex gap-3">
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
              />
              <input
                type="tel"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="Phone"
                className="flex-1 h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
              />
            </div>
          </div>

          {/* Job description (editable) */}
          <div className="mb-8">
            <h2 className="font-display text-lg text-navy mb-2">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Describe the job..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-sm resize-none"
            />
          </div>

          {/* Line items editor */}
          <h2 className="font-display text-lg text-navy mb-4">Line Items</h2>
          <Step2LineItems
            lineItems={lineItems}
            onLineItemsChange={setLineItems}
            notes={notes}
            onNotesChange={setNotes}
            terms={terms}
            onTermsChange={setTerms}
            subtotal={subtotal}
            tax={tax}
            taxRate={taxRate}
            total={total}
          />

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className={`w-full h-12 rounded-lg font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
                success
                  ? 'bg-green-500 text-white'
                  : 'border border-navy/20 text-navy hover:bg-navy/5'
              }`}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : success ? (
                <span className="inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </span>
              ) : 'Save Draft'}
            </button>

            <button
              disabled
              className="w-full h-12 rounded-lg bg-gold text-navy font-semibold text-sm transition-all disabled:opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
              </svg>
              Send to Client's Email — Not Working
            </button>

            <button
              onClick={() => handleMarkSent('copy')}
              disabled={saving || lineItems.length === 0}
              className="w-full h-12 rounded-lg border border-navy/20 text-navy font-semibold text-sm transition-all hover:bg-navy/5 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
              </svg>
              {copied ? 'Link Copied!' : "Copy Share Link & Mark as 'Ready to Send'"}
            </button>
          </div>
        </div>
      ) : (
        /* NON-DRAFT: Read-only view */
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Client info */}
          <div className="mb-6 pb-5 border-b border-navy/10">
            <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-2">Client</p>
            <p className="text-base font-semibold text-navy">{quote.clientName}</p>
            {(quote.clientEmail || quote.clientPhone) && (
              <p className="text-sm text-navy/50 mt-0.5">
                {[quote.clientEmail, quote.clientPhone].filter(Boolean).join(' \u00B7 ')}
              </p>
            )}
          </div>

          {/* Job description */}
          {quote.jobDescription && (
            <div className="mb-6 pb-5 border-b border-navy/10">
              <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-2">Job Description</p>
              <p className="text-sm text-navy/70 whitespace-pre-line">{quote.jobDescription}</p>
            </div>
          )}

          {/* Line items */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-3">Line Items</p>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-navy/10">
                    <th className="text-left text-xs font-semibold text-navy/40 uppercase tracking-wider pb-2">Description</th>
                    <th className="text-right text-xs font-semibold text-navy/40 uppercase tracking-wider pb-2 w-16">Qty</th>
                    <th className="text-right text-xs font-semibold text-navy/40 uppercase tracking-wider pb-2 w-20">Unit</th>
                    <th className="text-right text-xs font-semibold text-navy/40 uppercase tracking-wider pb-2 w-24">Price</th>
                    <th className="text-right text-xs font-semibold text-navy/40 uppercase tracking-wider pb-2 w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(quote.lineItems || []).map((item, i) => (
                    <tr key={i} className="border-b border-navy/5">
                      <td className="py-2.5 text-navy">{item.description}</td>
                      <td className="py-2.5 text-right text-navy/70">{item.quantity}</td>
                      <td className="py-2.5 text-right text-navy/40 text-xs">{item.unit}</td>
                      <td className="py-2.5 text-right text-navy/70">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-medium text-navy">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {(quote.lineItems || []).map((item, i) => (
                <div key={i} className="bg-cream/50 rounded-lg p-3 border border-navy/5">
                  <p className="text-sm font-medium text-navy mb-1">{item.description}</p>
                  <div className="flex justify-between text-xs text-navy/50">
                    <span>{item.quantity} {item.unit} &times; {formatCurrency(item.unitPrice)}</span>
                    <span className="font-semibold text-navy">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-sm text-navy/60">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal || 0)}</span>
              </div>
              {(quote.taxRate > 0) && (
                <div className="flex justify-between text-sm text-navy/60">
                  <span>Tax ({quote.taxRate}%)</span>
                  <span>{formatCurrency(quote.tax || 0)}</span>
                </div>
              )}
              <div className="border-t border-navy/10 pt-2 flex justify-between text-base font-semibold text-navy">
                <span>Total</span>
                <span>{formatCurrency(quote.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="mb-6 p-4 bg-cream/50 rounded-lg border border-navy/5">
              <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-2">Notes & Terms</p>
              <p className="text-sm text-navy/60 whitespace-pre-line">{quote.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-navy/10">
            <button
              onClick={handleCopyLink}
              className="w-full h-12 rounded-lg bg-gold text-navy font-semibold text-sm transition-all hover:bg-gold-light active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
              </svg>
              {copied ? 'Copied!' : 'Copy Share Link'}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full h-12 rounded-lg border border-navy/20 text-navy font-medium text-sm hover:bg-navy/5 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {downloadingPdf ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating PDF…
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete — always available */}
      <div className="mt-6 text-center">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Delete Quote
          </button>
        ) : (
          <div className="inline-flex items-center gap-3">
            <span className="text-sm text-red-600 font-medium">Delete this quote?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="h-9 px-4 rounded-lg border border-navy/20 text-navy/60 text-sm font-medium hover:bg-navy/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
