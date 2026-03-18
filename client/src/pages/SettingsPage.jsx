import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const PRESET_COLORS = [
  { name: 'Navy', value: '#1B2A4A' },
  { name: 'Teal', value: '#0D7377' },
  { name: 'Forest', value: '#2D5016' },
  { name: 'Burgundy', value: '#722F37' },
  { name: 'Charcoal', value: '#36454F' },
  { name: 'Royal Blue', value: '#1A3C8F' },
  { name: 'Slate', value: '#4A5568' },
  { name: 'Espresso', value: '#3C1518' },
];

const TEMPLATES = [
  { id: 'clean-minimal', name: 'Clean Minimal', description: 'Lots of whitespace, thin lines, modern feel' },
  { id: 'bold-modern', name: 'Bold Modern', description: 'Color header, bold type, strong presence' },
  { id: 'classic-professional', name: 'Classic Professional', description: 'Traditional layout, serif accents, timeless' },
];

function TemplatePreview({ template, brandColor, selected }) {
  if (template.id === 'clean-minimal') {
    return (
      <div className="w-full aspect-[3/4] bg-white rounded border border-navy/10 p-3 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="w-8 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
          <div className="space-y-0.5">
            <div className="w-10 h-1 bg-navy/10 rounded-full" />
            <div className="w-8 h-1 bg-navy/10 rounded-full" />
          </div>
        </div>
        <div className="border-t border-navy/5 pt-2 mb-2">
          <div className="w-12 h-1 bg-navy/15 rounded-full mb-1" />
          <div className="w-16 h-1 bg-navy/10 rounded-full" />
        </div>
        <div className="flex-1 space-y-1.5 mt-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between">
              <div className="w-14 h-1 bg-navy/8 rounded-full" />
              <div className="w-6 h-1 bg-navy/8 rounded-full" />
            </div>
          ))}
        </div>
        <div className="border-t border-navy/5 pt-1.5 mt-auto flex justify-end">
          <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.6 }} />
        </div>
      </div>
    );
  }

  if (template.id === 'bold-modern') {
    return (
      <div className="w-full aspect-[3/4] bg-white rounded border border-navy/10 flex flex-col overflow-hidden">
        <div className="px-3 py-2.5" style={{ backgroundColor: brandColor }}>
          <div className="w-10 h-1.5 bg-white/90 rounded-full mb-1" />
          <div className="w-14 h-1 bg-white/40 rounded-full" />
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <div className="mb-2">
            <div className="w-12 h-1 bg-navy/20 rounded-full mb-1" />
            <div className="w-16 h-1 bg-navy/10 rounded-full" />
          </div>
          <div className="flex-1 space-y-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-14 h-1 bg-navy/8 rounded-full" />
                <div className="w-6 h-1 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.3 }} />
              </div>
            ))}
          </div>
          <div className="border-t-2 pt-1.5 mt-auto flex justify-end" style={{ borderColor: brandColor }}>
            <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.7 }} />
          </div>
        </div>
      </div>
    );
  }

  // classic-professional
  return (
    <div className="w-full aspect-[3/4] rounded border border-navy/10 flex flex-col p-3" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="text-center mb-2 pb-2 border-b border-navy/10">
        <div className="w-10 h-1.5 mx-auto rounded-full mb-1" style={{ backgroundColor: brandColor }} />
        <div className="w-14 h-1 bg-navy/10 rounded-full mx-auto" />
      </div>
      <div className="mb-2">
        <div className="w-8 h-1 rounded-full mb-1" style={{ backgroundColor: brandColor, opacity: 0.4 }} />
        <div className="w-16 h-1 bg-navy/10 rounded-full" />
      </div>
      <div className="flex-1 space-y-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between border-b border-dotted border-navy/5 pb-1">
            <div className="w-14 h-1 bg-navy/10 rounded-full" />
            <div className="w-6 h-1 bg-navy/10 rounded-full" />
          </div>
        ))}
      </div>
      <div className="border-t border-double border-navy/15 pt-1.5 mt-auto flex justify-end">
        <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.5 }} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    phone: user?.phone || '',
    address: user?.address || '',
    email: user?.email || '',
    brandColor: user?.brandColor || '#1B2A4A',
    templateStyle: user?.templateStyle || 'clean-minimal',
    taxRate: user?.taxRate ?? 0,
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Auto-dismiss success message
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        brandColor: form.brandColor,
        templateStyle: form.templateStyle,
        taxRate: parseFloat(form.taxRate) || 0,
      });
      setSuccess('Settings saved successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="font-display text-2xl text-navy mb-6">Settings</h1>

      {/* Success / Error Messages */}
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

      <div className="space-y-6">
        {/* Business Information */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-display text-lg text-navy mb-5">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy/70 mb-1.5">Your Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-navy/70 mb-1.5">Business Name</label>
              <input
                id="businessName"
                type="text"
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-1.5">Business Type</label>
              <p className="h-12 px-4 rounded-lg border border-navy/10 bg-navy/5 text-navy/60 flex items-center text-sm">
                {form.businessType || 'Not set'}
              </p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy/70 mb-1.5">Email</label>
              <p className="h-12 px-4 rounded-lg border border-navy/10 bg-navy/5 text-navy/60 flex items-center text-sm">
                {form.email}
              </p>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-navy/70 mb-1.5">Phone</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full h-12 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-navy/70 mb-1.5">Address</label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="123 Main St, City, State 12345"
                className="w-full h-12 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        </div>

        {/* Brand & Quote Style */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-display text-lg text-navy mb-5">Brand & Quote Style</h2>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-3">Brand Color</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => update('brandColor', color.value)}
                    className="w-10 h-10 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: color.value,
                      borderColor: form.brandColor === color.value ? '#D4A843' : 'transparent',
                      boxShadow: form.brandColor === color.value ? '0 0 0 2px #D4A843' : 'none',
                    }}
                    title={color.name}
                  >
                    {form.brandColor === color.value && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="customColor" className="text-sm text-navy/50">Custom:</label>
                <input
                  id="customColor"
                  type="color"
                  value={form.brandColor}
                  onChange={(e) => update('brandColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-navy/20 cursor-pointer p-0.5"
                />
                <span className="text-sm text-navy/40 font-mono">{form.brandColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy/70 mb-3">Quote Template</label>
              <div className="grid grid-cols-3 gap-3">
                {TEMPLATES.map((template) => {
                  const isSelected = form.templateStyle === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => update('templateStyle', template.id)}
                      className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-gold shadow-md' : 'border-navy/10 hover:border-navy/25'}`}
                    >
                      <TemplatePreview template={template} brandColor={form.brandColor} selected={isSelected} />
                      <p className="text-xs font-medium text-navy mt-2 text-center">{template.name}</p>
                      <p className="text-[10px] text-navy/40 mt-0.5 text-center leading-tight hidden sm:block">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tax Rate */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-display text-lg text-navy mb-5">Tax Rate</h2>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={form.taxRate}
              onChange={(e) => update('taxRate', e.target.value)}
              min="0"
              max="100"
              step="0.01"
              className="w-28 h-12 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            <span className="text-sm font-medium text-navy/60">%</span>
          </div>
          <p className="text-xs text-navy/40 mt-2">Applied to all new quotes</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full h-12 rounded-lg font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 ${
            success
              ? 'bg-green-500 text-white'
              : 'bg-gold text-navy hover:bg-gold-light'
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
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}
