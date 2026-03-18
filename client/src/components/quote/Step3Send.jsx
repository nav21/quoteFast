export default function Step3Send({ onSave, saving }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-navy/60 mb-4">
        Your quote is ready. Send it to your client or save as a draft.
      </p>

      {/* Send to Client's Email — disabled, not working */}
      <button
        type="button"
        disabled
        className="w-full h-12 rounded-lg bg-gold text-navy font-semibold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
          <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
        </svg>
        Send to Client's Email — Not Working
      </button>

      {/* Copy Quote Share Link & Mark as 'Ready to Send' */}
      <button
        type="button"
        onClick={() => onSave('ready', 'copy')}
        disabled={saving}
        className="w-full h-12 rounded-lg border border-navy/20 text-navy font-semibold text-base transition-all hover:bg-navy/5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {saving ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </span>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
              <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
            </svg>
            Copy Share Link & Mark as 'Ready to Send'
          </>
        )}
      </button>

      {/* Save as Draft — text button */}
      <button
        type="button"
        onClick={() => onSave('draft')}
        disabled={saving}
        className="w-full h-12 text-navy/50 font-medium text-sm hover:text-navy transition-colors cursor-pointer disabled:opacity-40"
      >
        Save as Draft
      </button>
    </div>
  );
}
