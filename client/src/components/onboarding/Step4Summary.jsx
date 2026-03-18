const TEMPLATE_NAMES = {
  'clean-minimal': 'Clean Minimal',
  'bold-modern': 'Bold Modern',
  'classic-professional': 'Classic Professional',
};

export default function Step4Summary({ data, serviceCount }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gold-dark">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
        </div>
        <h3 className="font-display text-xl text-navy">You&apos;re all set!</h3>
        <p className="text-sm text-navy/50 mt-1">Here&apos;s a summary of your setup</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-navy/10 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-3">Business</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-navy/60">Name</span>
              <span className="text-sm font-medium text-navy">{data.businessName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-navy/60">Type</span>
              <span className="text-sm font-medium text-navy">{data.businessType || '—'}</span>
            </div>
            {data.phone && (
              <div className="flex justify-between">
                <span className="text-sm text-navy/60">Phone</span>
                <span className="text-sm font-medium text-navy">{data.phone}</span>
              </div>
            )}
            {data.address && (
              <div className="flex justify-between">
                <span className="text-sm text-navy/60">Address</span>
                <span className="text-sm font-medium text-navy text-right max-w-[60%]">{data.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-navy/10 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-3">Branding</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-navy/60">Brand Color</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-navy/10" style={{ backgroundColor: data.brandColor }} />
                <span className="text-sm font-mono text-navy/50">{data.brandColor}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-navy/60">Template</span>
              <span className="text-sm font-medium text-navy">{TEMPLATE_NAMES[data.templateStyle] || data.templateStyle}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-navy/10 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-3">Services</h4>
          <div className="flex justify-between">
            <span className="text-sm text-navy/60">Services in catalog</span>
            <span className="text-sm font-medium text-navy">{serviceCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
