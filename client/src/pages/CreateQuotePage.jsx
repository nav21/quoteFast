import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import Step1ClientJob from '../components/quote/Step1ClientJob.jsx';
import Step2LineItems from '../components/quote/Step2LineItems.jsx';
import Step3Send from '../components/quote/Step3Send.jsx';

const STEPS = ['Describe Job', 'Line Items', 'Send'];

export default function CreateQuotePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);

  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [jobDescription, setJobDescription] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [taxRate, setTaxRate] = useState(user?.taxRate || 0);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const t = Math.round(sub * taxRate) / 100;
    return { subtotal: sub, tax: t, total: sub + t };
  }, [lineItems, taxRate]);

  const handleGenerate = async () => {
    setError('');
    if (!clientInfo.name.trim()) {
      setError('Client name is required.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please describe the job.');
      return;
    }

    setGenerating(true);
    try {
      const data = await api.fetch('/api/quotes/generate', {
        method: 'POST',
        body: JSON.stringify({
          clientName: clientInfo.name.trim(),
          clientEmail: clientInfo.email.trim(),
          clientPhone: clientInfo.phone.trim(),
          clientAddress: clientInfo.address.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      setLineItems(
        (data.lineItems || []).map(item => ({
          ...item,
          _tempId: crypto.randomUUID(),
        }))
      );
      setNotes(data.notes || '');
      setTerms(data.suggestedTerms || '');
      if (data.taxRate != null) setTaxRate(data.taxRate);
      setFallbackMode(false);
      setCurrentStep(2);
    } catch (err) {
      if (err.message && (err.message.includes('fallback') || err.message.includes('not configured'))) {
        setFallbackMode(true);
        setCurrentStep(2);
      } else {
        setError(err.message || 'Failed to generate quote. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSkipToManual = () => {
    setFallbackMode(true);
    setCurrentStep(2);
  };

  const handleReviewAndSend = () => {
    setError('');
    if (lineItems.length === 0) {
      setError('Add at least one line item to continue.');
      return;
    }
    setCurrentStep(3);
  };

  const handleSave = async (status, action) => {
    setError('');
    setSaving(true);

    const combinedNotes = [notes, terms].filter(Boolean).join('\n\n---\nTerms & Conditions:\n');

    try {
      const quote = await api.fetch('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          clientName: clientInfo.name.trim(),
          clientEmail: clientInfo.email.trim(),
          clientPhone: clientInfo.phone.trim(),
          jobDescription: jobDescription.trim(),
          lineItems: lineItems.map(({ _tempId, ...rest }) => rest),
          subtotal,
          tax,
          taxRate,
          total,
          notes: combinedNotes,
          status,
        }),
      });

      if (action === 'copy' && quote.shareToken) {
        // Status will be 'ready' from onSave('ready', 'copy')
        const shareUrl = `${window.location.origin}/quote/${quote.shareToken}`;
        try { await navigator.clipboard.writeText(shareUrl); } catch { window.prompt('Copy this link:', shareUrl); }
      }

      navigate(`/quotes/${quote._id}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl text-navy">Create a Quote</h1>
          <p className="text-sm text-navy/50 mt-1">Step {currentStep} of {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full transition-colors"
                style={{ backgroundColor: i < currentStep ? '#D4A843' : '#1B2A4A1A' }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`flex-1 text-[11px] font-medium transition-colors ${i < currentStep ? 'text-gold-dark' : i === currentStep - 1 ? 'text-navy' : 'text-navy/30'}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="font-display text-lg text-navy mb-5">
            {currentStep === 1 && 'Client & Job Details'}
            {currentStep === 2 && 'Review Line Items'}
            {currentStep === 3 && 'Send Your Quote'}
          </h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <Step1ClientJob
              clientInfo={clientInfo}
              onClientInfoChange={setClientInfo}
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              onSkipToManual={handleSkipToManual}
            />
          )}
          {currentStep === 2 && (
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
              fallbackMode={fallbackMode}
            />
          )}
          {currentStep === 3 && (
            <Step3Send
              onSave={handleSave}
              saving={saving}
              clientEmail={clientInfo.email.trim()}
            />
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={generating || saving}
                className="h-12 px-6 rounded-lg border border-navy/20 text-navy font-medium text-sm hover:bg-navy/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Back
              </button>
            )}
            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 h-12 rounded-lg bg-gold text-navy font-semibold text-base transition-all hover:bg-gold-light active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {generating ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Quote'
                )}
              </button>
            )}
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleReviewAndSend}
                className="flex-1 h-12 rounded-lg bg-gold text-navy font-semibold text-base transition-all hover:bg-gold-light active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
