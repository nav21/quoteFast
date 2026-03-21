import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPhone } from '../utils/formatPhone.js';

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
  { id: 'compact-estimate', name: 'Compact Estimate', description: 'Dense layout, no-frills, quick estimates' },
  { id: 'executive-proposal', name: 'Executive Proposal', description: 'Premium presentation for big jobs' },
  { id: 'friendly-approachable', name: 'Friendly & Approachable', description: 'Warm, casual, great for residential' },
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

  if (template.id === 'compact-estimate') {
    return (
      <div className="w-full aspect-[3/4] bg-white rounded border border-navy/10 p-3 flex flex-col">
        <div className="flex justify-between items-center pb-1.5 mb-2" style={{ borderBottom: `2px solid ${brandColor}` }}>
          <div className="w-10 h-1.5 rounded-sm" style={{ backgroundColor: brandColor }} />
          <div className="w-8 h-1 bg-navy/20 rounded-full" />
        </div>
        <div className="bg-[#f5f5f5] border border-[#e5e5e5] px-1.5 py-1 mb-2">
          <div className="w-12 h-1 bg-navy/15 rounded-full mb-0.5" />
          <div className="w-8 h-0.5 bg-navy/8 rounded-full" />
        </div>
        <div className="flex-1 space-y-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center py-0.5" style={{ backgroundColor: i % 2 === 0 ? '#fafafa' : 'transparent' }}>
              <div className="w-14 h-1 bg-navy/8 rounded-full" />
              <div className="w-6 h-1 bg-navy/8 rounded-full" />
            </div>
          ))}
        </div>
        <div className="pt-1.5 mt-auto flex justify-end" style={{ borderTop: `2px solid ${brandColor}` }}>
          <div className="w-10 h-1.5 rounded-sm" style={{ backgroundColor: brandColor, opacity: 0.7 }} />
        </div>
      </div>
    );
  }

  if (template.id === 'friendly-approachable') {
    return (
      <div className="w-full aspect-[3/4] bg-white rounded border border-navy/10 p-3 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: brandColor, opacity: 0.7 }} />
          <div className="w-8 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
        </div>
        <div className="rounded-md px-2 py-2 mb-2" style={{ background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}25 100%)` }}>
          <div className="w-12 h-1 bg-navy/20 rounded-full mb-1" />
          <div className="w-16 h-0.5 bg-navy/10 rounded-full" />
        </div>
        <div className="flex-1 space-y-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center bg-[#f8f8f8] rounded px-1.5 py-1">
              <div className="w-12 h-1 bg-navy/10 rounded-full" />
              <div className="w-5 h-1 bg-navy/10 rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center rounded px-2 py-1.5 mt-auto" style={{ backgroundColor: brandColor }}>
          <div className="w-8 h-1 bg-white/70 rounded-full" />
          <div className="w-6 h-1 bg-white/90 rounded-full" />
        </div>
      </div>
    );
  }

  if (template.id === 'executive-proposal') {
    return (
      <div className="w-full aspect-[3/4] rounded border border-navy/10 flex flex-col overflow-hidden" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />
        <div className="p-3 flex-1 flex flex-col">
          <div className="text-center mb-1.5 pb-1.5" style={{ borderBottom: `1.5px solid ${brandColor}` }}>
            <div className="w-14 h-1.5 mx-auto rounded-full mb-0.5" style={{ backgroundColor: brandColor, opacity: 0.5 }} />
            <div className="w-10 h-0.5 mx-auto bg-navy/10 rounded-full" />
          </div>
          <div className="mb-2" style={{ borderBottom: `1px solid ${brandColor}30` }} />
          <div className="flex gap-1.5 mb-2">
            <div className="flex-1 rounded p-1" style={{ backgroundColor: '#f4f2ed' }}>
              <div className="w-6 h-0.5 bg-navy/15 rounded-full mb-0.5" />
              <div className="w-8 h-0.5 bg-navy/10 rounded-full" />
            </div>
            <div className="flex-1 rounded p-1" style={{ backgroundColor: '#f4f2ed' }}>
              <div className="w-6 h-0.5 bg-navy/15 rounded-full mb-0.5" />
              <div className="w-8 h-0.5 bg-navy/10 rounded-full" />
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between border-b border-navy/5 pb-1">
                <div className="w-14 h-1 bg-navy/8 rounded-full" />
                <div className="w-6 h-1 bg-navy/8 rounded-full" />
              </div>
            ))}
          </div>
          <div className="mx-auto w-16 rounded py-1 mt-auto mb-1" style={{ backgroundColor: brandColor }}>
            <div className="w-8 h-1.5 mx-auto bg-white/80 rounded-full" />
          </div>
          <div className="mt-1" style={{ borderTop: `1px solid ${brandColor}40` }} />
          <div className="mt-0.5 pt-1" style={{ borderTop: `1px solid ${brandColor}30` }}>
            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ backgroundColor: brandColor, opacity: 0.4 }} />
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
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const isFirstRender = useRef(true);

  const [form, setForm] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    phone: formatPhone(user?.phone || ''),
    address: user?.address || '',
    email: user?.email || '',
    brandColor: user?.brandColor || '#1B2A4A',
    templateStyle: user?.templateStyle || 'clean-minimal',
    taxRate: user?.taxRate ?? 0,
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const doSave = useCallback(async (data) => {
    setSaveStatus('saving');
    setError('');
    try {
      await updateProfile({
        name: data.name.trim(),
        businessName: data.businessName.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        brandColor: data.brandColor,
        templateStyle: data.templateStyle,
        taxRate: parseFloat(data.taxRate) || 0,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(s => s === 'saved' ? 'idle' : s), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
      setSaveStatus('error');
    }
  }, [updateProfile]);

  // Auto-save on form changes with debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(form), 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [form, doSave]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Sticky save status toast */}
      {(saveStatus === 'saving' || saveStatus === 'saved') && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white shadow-lg border border-navy/10 text-sm flex items-center gap-2 animate-[selectSlide_200ms_ease-out]">
          {saveStatus === 'saving' && (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-navy/40" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-navy/50">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-500">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              <span className="text-green-600">Saved</span>
            </>
          )}
        </div>
      )}

      <h1 className="font-display text-2xl text-navy mb-6">Settings</h1>

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
                onChange={(e) => update('phone', formatPhone(e.target.value))}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      </div>
    </div>
  );
}
