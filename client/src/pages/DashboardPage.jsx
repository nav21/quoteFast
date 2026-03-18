import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import CustomSelect from '../components/CustomSelect.jsx';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600',
  ready: 'bg-purple-100 text-purple-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
  expired: 'bg-orange-100 text-orange-700',
};

function getDisplayStatus(quote) {
  if (
    quote.expiresAt &&
    new Date(quote.expiresAt) < new Date() &&
    (quote.status === 'ready' || quote.status === 'sent' || quote.status === 'viewed')
  ) {
    return 'expired';
  }
  return quote.status;
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="h-3 w-20 bg-navy/10 rounded-full animate-pulse mb-3" />
        <div className="h-7 w-16 bg-navy/10 rounded-full animate-pulse" />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}

function QuoteCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-navy/10 p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 w-16 bg-navy/10 rounded-full" />
        <div className="h-5 w-20 bg-navy/10 rounded-full" />
      </div>
      <div className="h-4 w-32 bg-navy/10 rounded-full mb-2" />
      <div className="h-3 w-40 bg-navy/10 rounded-full" />
    </div>
  );
}

export default function DashboardPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.fetch('/api/quotes')
      .then(data => setQuotes(data.quotes || data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Compute display status for each quote
  const quotesWithStatus = useMemo(() =>
    quotes.map(q => ({ ...q, displayStatus: getDisplayStatus(q) })),
    [quotes]
  );

  // Stats — always computed from full dataset
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const sentThisMonth = quotesWithStatus.filter(
      q => q.displayStatus !== 'draft' && new Date(q.createdAt) >= monthStart
    ).length;

    const approved = quotesWithStatus.filter(q => q.displayStatus === 'approved').length;
    const declined = quotesWithStatus.filter(q => q.displayStatus === 'declined').length;
    const decisions = approved + declined;
    const approvalRate = decisions > 0 ? Math.round((approved / decisions) * 100) : null;

    const revenueWon = quotesWithStatus
      .filter(q => q.displayStatus === 'approved')
      .reduce((sum, q) => sum + (q.total || 0), 0);

    return { sentThisMonth, approved, approvalRate, revenueWon };
  }, [quotesWithStatus]);

  // Filtered quotes for display
  const filteredQuotes = useMemo(() => {
    if (statusFilter === 'all') return quotesWithStatus;
    return quotesWithStatus.filter(q => q.displayStatus === statusFilter);
  }, [quotesWithStatus, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="font-display text-2xl text-navy">Dashboard</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Quotes Sent" value={stats.sentThisMonth} loading={loading} />
        <StatCard label="Quotes Approved" value={stats.approved} loading={loading} />
        <StatCard
          label="Approval Rate"
          value={stats.approvalRate !== null ? `${stats.approvalRate}%` : '\u2014'}
          loading={loading}
        />
        <StatCard label="Revenue Won" value={formatCurrency(stats.revenueWon)} loading={loading} />
      </div>

      {/* Filter + New Quote Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Quotes' },
            { value: 'draft', label: 'Draft' },
            { value: 'ready', label: 'Ready' },
            { value: 'sent', label: 'Sent' },
            { value: 'viewed', label: 'Viewed' },
            { value: 'approved', label: 'Approved' },
            { value: 'declined', label: 'Declined' },
            { value: 'expired', label: 'Expired' },
          ]}
          className="h-10 w-40"
        />

        <Link
          to="/quotes/new"
          className="hidden sm:flex h-10 px-5 rounded-lg bg-gold text-navy font-semibold text-sm items-center gap-2 hover:bg-gold-light active:scale-[0.98] transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          New Quote
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <QuoteCardSkeleton key={i} />)}
        </div>
      )}

      {/* Quote Cards */}
      {!loading && filteredQuotes.length > 0 && (
        <div className="space-y-3">
          {filteredQuotes.map(quote => (
            <Link
              to={`/quotes/${quote._id}`}
              key={quote._id}
              className="block bg-white rounded-xl border border-navy/10 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <StatusBadge status={quote.displayStatus} />
                <span className="text-lg font-bold text-navy">{formatCurrency(quote.total || 0)}</span>
              </div>
              <p className="text-sm font-medium text-navy mb-1">{quote.clientName}</p>
              <p className="text-xs text-navy/40">
                Quote #{quote.quoteNumber}
                {quote.createdAt && <> &middot; {formatDate(quote.createdAt)}</>}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredQuotes.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-navy/25">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          {quotes.length === 0 ? (
            <>
              <h3 className="font-display text-lg text-navy mb-1">No quotes yet</h3>
              <p className="text-sm text-navy/40 mb-6">Create your first quote to get started</p>
              <Link
                to="/quotes/new"
                className="inline-flex h-12 px-6 rounded-lg bg-gold text-navy font-semibold text-sm items-center gap-2 hover:bg-gold-light active:scale-[0.98] transition-all"
              >
                Create Your First Quote
              </Link>
            </>
          ) : (
            <h3 className="font-display text-lg text-navy mb-1">No quotes of this type</h3>
          )}
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        to="/quotes/new"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gold text-navy shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
        aria-label="New Quote"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </div>
  );
}
