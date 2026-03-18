export default function Step1ClientJob({ clientInfo, onClientInfoChange, jobDescription, onJobDescriptionChange, onSkipToManual }) {
  const update = (field, value) => {
    onClientInfoChange({ ...clientInfo, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          Client Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={clientInfo.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Sarah Johnson"
          className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Client Email</label>
        <input
          type="email"
          value={clientInfo.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="sarah@email.com"
          className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Phone</label>
          <input
            type="tel"
            value={clientInfo.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Address</label>
          <input
            type="text"
            value={clientInfo.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="123 Main St"
            className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          Describe the Job <span className="text-red-400">*</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="e.g. Kitchen sink leaking under cabinet. Customer wants faucet replaced and pipes checked for corrosion. Standard residential kitchen, about 10 years old."
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base resize-none"
        />
        <p className="text-xs text-navy/40 mt-1.5">
          Be specific — materials, scope, location details help generate a more accurate quote.
        </p>
      </div>

      <button
        type="button"
        onClick={onSkipToManual}
        className="text-sm text-navy/40 hover:text-gold-dark transition-colors cursor-pointer"
      >
        or enter line items manually &rarr;
      </button>
    </div>
  );
}
