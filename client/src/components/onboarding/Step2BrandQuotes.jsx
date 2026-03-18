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
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Lots of whitespace, thin lines, modern feel',
  },
  {
    id: 'bold-modern',
    name: 'Bold Modern',
    description: 'Color header, bold type, strong presence',
  },
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'Traditional layout, serif accents, timeless',
  },
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
                <div className="w-6 h-1 rounded-full font-bold" style={{ backgroundColor: brandColor, opacity: 0.3 }} />
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

export default function Step2BrandQuotes({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-navy/70 mb-3">
          Choose your brand color
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => update('brandColor', color.value)}
              className="w-10 h-10 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center"
              style={{
                backgroundColor: color.value,
                borderColor: data.brandColor === color.value ? '#D4A843' : 'transparent',
                boxShadow: data.brandColor === color.value ? '0 0 0 2px #D4A843' : 'none',
              }}
              title={color.name}
            >
              {data.brandColor === color.value && (
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
            value={data.brandColor}
            onChange={(e) => update('brandColor', e.target.value)}
            className="w-10 h-10 rounded-lg border border-navy/20 cursor-pointer p-0.5"
          />
          <span className="text-sm text-navy/40 font-mono">{data.brandColor}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy/70 mb-3">
          Choose your quote style
        </label>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((template) => {
            const isSelected = data.templateStyle === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => update('templateStyle', template.id)}
                className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-gold shadow-md' : 'border-navy/10 hover:border-navy/25'}`}
              >
                <TemplatePreview template={template} brandColor={data.brandColor} selected={isSelected} />
                <p className="text-xs font-medium text-navy mt-2 text-center">{template.name}</p>
                <p className="text-[10px] text-navy/40 mt-0.5 text-center leading-tight hidden sm:block">{template.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
