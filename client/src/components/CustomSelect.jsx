import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

function normalizeOptions(options) {
  return options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
}

export default function CustomSelect({
  value,
  onChange,
  options: rawOptions,
  placeholder = 'Select...',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  const options = useMemo(() => normalizeOptions(rawOptions), [rawOptions]);
  const selectedOption = options.find(o => o.value === value);
  const selectedIndex = options.findIndex(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Auto-position: check if dropdown should open upward
  const checkPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = Math.min(options.length * 40 + 8, 260);
    setDropUp(spaceBelow < estimatedHeight && rect.top > estimatedHeight);
  }, [options.length]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIndex < 0 || !listRef.current) return;
    const items = listRef.current.children;
    if (items[focusedIndex]) {
      items[focusedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, open]);

  const handleToggle = () => {
    if (!open) {
      checkPosition();
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
    setOpen(prev => !prev);
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        checkPosition();
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          handleSelect(options[focusedIndex]);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={open && focusedIndex >= 0 ? `option-${focusedIndex}` : undefined}
        className={`
          w-full flex items-center justify-between gap-2 px-3
          rounded-lg border bg-cream/50 text-left
          outline-none cursor-pointer transition-all duration-150
          ${open
            ? 'border-gold ring-2 ring-gold/20'
            : 'border-navy/20 hover:border-navy/35'
          }
          ${selectedOption ? 'text-navy' : 'text-navy/40'}
          text-sm
        `}
        style={{ height: 'inherit' }}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 shrink-0 text-navy/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className={`
            absolute left-0 right-0 z-50 py-1 overflow-auto
            bg-white border border-navy/10 rounded-xl
            shadow-[0_8px_30px_-4px_rgba(27,42,74,0.12)]
            animate-[selectSlide_150ms_ease-out]
            ${dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}
          `}
          style={{ maxHeight: '252px' }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isFocused = i === focusedIndex;
            return (
              <li
                key={opt.value}
                id={`option-${i}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setFocusedIndex(i)}
                className={`
                  flex items-center justify-between gap-2 px-3 py-2.5 mx-1 rounded-lg
                  text-sm cursor-pointer transition-colors duration-100 select-none
                  ${isFocused
                    ? isSelected
                      ? 'bg-gold/15 text-navy'
                      : 'bg-navy/[0.04] text-navy'
                    : isSelected
                      ? 'bg-gold/10 text-navy'
                      : 'text-navy/70'
                  }
                `}
              >
                <span className={`truncate ${isSelected ? 'font-semibold' : ''}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 shrink-0 text-gold"
                  >
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
