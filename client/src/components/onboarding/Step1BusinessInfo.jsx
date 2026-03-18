import { useState, useEffect } from 'react';
import { BUSINESS_TYPE_GROUPS } from '../../data/defaultServices.js';

const TYPE_ICONS = {
  Plumbing: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/><path d="M6 12h12l-2 10H8L6 12z"/><path d="M12 12v4"/></svg>
  ),
  Electrical: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  ),
  HVAC: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 14.5 2z"/></svg>
  ),
  Cleaning: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2v6m0 0c-3.3 0-6 1.3-6 3v1h12v-1c0-1.7-2.7-3-6-3z"/><path d="M6 12l1 10h10l1-10"/><path d="M8 2h8"/></svg>
  ),
  Landscaping: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 3c-1.5 2-4 4-4 7a4 4 0 0 0 8 0c0-3-2.5-5-4-7z"/><path d="M12 14v8"/><path d="M8 22h8"/></svg>
  ),
  Painting: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="3" width="20" height="10" rx="2"/><path d="M12 13v4"/><path d="M10 17h4v4H10z"/></svg>
  ),
  Roofing: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>
  ),
  'General Contracting': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 2l10 4"/><path d="M12 2L2 6"/><path d="M17 22V6"/><path d="M7 22V6"/></svg>
  ),
  Handyman: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ),
  'Pest Control': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 8a4 4 0 0 1 4 4v4a4 4 0 0 1-8 0v-4a4 4 0 0 1 4-4z"/><path d="M12 2v2"/><path d="M8 4l1 2"/><path d="M16 4l-1 2"/><path d="M4 12h2"/><path d="M18 12h2"/><path d="M5 18l2-1"/><path d="M19 18l-2-1"/></svg>
  ),
  'Pressure Washing': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2v6"/><path d="M8 6h8l-1 3H9L8 6z"/><path d="M10 9l-2 13"/><path d="M14 9l2 13"/><path d="M6 22h12"/></svg>
  ),
  Photography: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  Videography: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
  ),
  'Graphic Design': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/><path d="M2 16l5-5 4 4 4-4 7 7"/></svg>
  ),
  'Web Design': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8l-2 2 2 2"/><path d="M17 8l2 2-2 2"/></svg>
  ),
  'Event Planning': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>
  ),
  'DJ & Entertainment': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/></svg>
  ),
  Florist: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  Catering: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 17h18"/><path d="M4 17c0-5 3-8 8-8s8 3 8 8"/><path d="M12 3v6"/><path d="M8 5l1 2"/><path d="M16 5l-1 2"/></svg>
  ),
  Consulting: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  Tutoring: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>
  ),
  Coaching: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
  ),
  Bookkeeping: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h4"/></svg>
  ),
  'Personal Training': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6.5 6.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/><path d="M2 14l3-3 3 3"/><path d="M8 11v9"/><path d="M5 20h6"/><path d="M18 4l2 2-2 2"/><path d="M14 4l-2 2 2 2"/><path d="M14 6h6"/><path d="M17 10v10"/></svg>
  ),
  'Interior Design': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  'Auto Detailing': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 1-1.73l3-1.64A2 2 0 0 1 8 5h8a2 2 0 0 1 1 .27l3 1.64A2 2 0 0 1 21 9v6a2 2 0 0 1-2 2M5 17l-1 2h2m13-2l1 2h-2"/><circle cx="7.5" cy="13" r="1.5"/><circle cx="16.5" cy="13" r="1.5"/></svg>
  ),
  'Auto Repair': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ),
  'Mobile Mechanic': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M1 17h2l2-7h12l2 7h2"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></svg>
  ),
  Moving: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="1" y="6" width="15" height="12" rx="1"/><path d="M16 10h4l3 3v5h-7V10z"/><circle cx="7" cy="20" r="2"/><circle cx="20" cy="20" r="2"/></svg>
  ),
  'Pet Grooming': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M10 5.172C10 3.782 8.884 2.5 7.5 2.5 6.116 2.5 5 3.782 5 5.172 5 6.56 7.5 10 7.5 10S10 6.56 10 5.172z"/><path d="M19 5.172C19 3.782 17.884 2.5 16.5 2.5c-1.384 0-2.5 1.282-2.5 2.672C14 6.56 16.5 10 16.5 10S19 6.56 19 5.172z"/><path d="M12 22c4 0 7-2 7-6 0-3-2-5-4-6.5a16 16 0 0 0-3-2 16 16 0 0 0-3 2C7 11 5 13 5 16c0 4 3 6 7 6z"/></svg>
  ),
  Other: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  ),
};

// Tabs — exclude "Other" group, it appears as a card inside the last visible tab's grid
const TABS = BUSINESS_TYPE_GROUPS.filter(g => g.label !== 'Other');

// Find which tab a given type lives in (for auto-selecting tab on mount)
function tabIndexForType(type) {
  if (type === 'Other') return TABS.length - 1;
  const idx = TABS.findIndex(g => g.types.includes(type));
  return idx === -1 ? 0 : idx;
}

export default function Step1BusinessInfo({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  const [activeTab, setActiveTab] = useState(() => tabIndexForType(data.businessType));

  // If user already selected a type, ensure we show the right tab
  useEffect(() => {
    if (data.businessType) {
      setActiveTab(tabIndexForType(data.businessType));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeGroup = TABS[activeTab];
  // Append "Other" card to whichever tab is active
  const cardsToShow = [...activeGroup.types, ...(activeGroup.label === 'Auto & Specialty' ? ['Other'] : [])];
  // But still show Other on every tab? The plan says 4 tabs + Other as its own group.
  // Let's just always show Other as a card at the end of the grid.
  const typesForGrid = activeGroup.label === 'Auto & Specialty'
    ? [...activeGroup.types, 'Other']
    : activeGroup.types;

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-navy/70 mb-1.5">
          Business Name <span className="text-gold-dark">*</span>
        </label>
        <input
          id="businessName"
          type="text"
          value={data.businessName}
          onChange={(e) => update('businessName', e.target.value)}
          placeholder="Smith's Plumbing"
          className="w-full h-12 px-4 text-base rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      {/* Business Type — visual card picker */}
      <div>
        <label className="block text-sm font-medium text-navy/70 mb-2">
          Business Type <span className="text-gold-dark">*</span>
        </label>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {TABS.map((group, i) => {
            const shortLabel = group.label.replace('Services', '').replace('& Specialty', '& More').trim();
            return (
              <button
                key={group.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === i
                    ? 'bg-navy text-cream shadow-sm'
                    : 'bg-navy/5 text-navy/50 hover:bg-navy/10 hover:text-navy/70'
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {typesForGrid.map((type) => {
            const selected = data.businessType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => update('businessType', type)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center cursor-pointer ${
                  selected
                    ? 'border-gold bg-gold/10 shadow-sm'
                    : 'border-navy/10 bg-white hover:border-navy/25 hover:shadow-sm'
                }`}
              >
                <span className={`transition-colors ${selected ? 'text-gold-dark' : 'text-navy/40'}`}>
                  {TYPE_ICONS[type] || TYPE_ICONS.Other}
                </span>
                <span className={`text-[11px] leading-tight font-medium ${selected ? 'text-navy' : 'text-navy/60'}`}>
                  {type}
                </span>
              </button>
            );
          })}
        </div>

        {data.businessType && (
          <p className="text-xs text-navy/40 mt-2">
            Selected: <span className="font-medium text-navy/70">{data.businessType}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-navy/70 mb-1.5">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="(555) 123-4567"
          className="w-full h-12 px-4 text-base rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy/70 mb-1.5">
          Business Email
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="hello@smithplumbing.com"
          className="w-full h-12 px-4 text-base rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-navy/70 mb-1.5">
          Business Address
        </label>
        <input
          id="address"
          type="text"
          value={data.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="123 Main St, City, State 12345"
          className="w-full h-12 px-4 text-base rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy/70 mb-1.5">
          Business Logo
        </label>
        <div className="border border-navy/15 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 mx-auto text-navy/25 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
          </svg>
          <p className="text-sm text-navy/40">Logo upload coming soon</p>
        </div>
      </div>
    </div>
  );
}
