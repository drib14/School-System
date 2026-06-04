import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect — Beautiful animated dropdown replacement for native <select>
 *
 * Props:
 *   value       - current value
 *   onChange    - (value) => void
 *   options     - [{ value, label }] or ['string', ...]
 *   placeholder - string shown when no value selected
 *   className   - extra className on wrapper
 *   disabled    - bool
 *   size        - 'sm' | 'md' (default 'md')
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  disabled = false,
  size = 'md',
  id,
}) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const uid = useId();
  const selectId = id || uid;

  // Normalize options to { value, label }
  const normalized = options.map(o =>
    typeof o === 'object' ? o : { value: o, label: o }
  );

  const selected = normalized.find(o => String(o.value) === String(value));

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setFocusIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Scroll focused item into view
  useEffect(() => {
    if (open && focusIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      items[focusIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusIdx, open]);

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
        setFocusIdx(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIdx(i => Math.min(i + 1, normalized.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusIdx >= 0 && normalized[focusIdx]) {
          onChange(normalized[focusIdx].value);
          setOpen(false);
          setFocusIdx(-1);
        }
        break;
      case 'Escape':
        setOpen(false);
        setFocusIdx(-1);
        break;
      case 'Tab':
        setOpen(false);
        setFocusIdx(-1);
        break;
    }
  };

  const sizeClass = size === 'sm' ? 'cs-trigger--sm' : 'cs-trigger--md';

  return (
    <div
      ref={containerRef}
      className={`cs-root ${className}`}
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        id={selectId}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        disabled={disabled}
        className={`cs-trigger ${sizeClass} ${open ? 'cs-trigger--open' : ''} ${!selected ? 'cs-trigger--placeholder' : ''}`}
        onClick={() => { if (!disabled) { setOpen(o => !o); setFocusIdx(0); } }}
        onKeyDown={handleKeyDown}
      >
        <span className="cs-trigger-label">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={`cs-arrow ${open ? 'cs-arrow--open' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="cs-dropdown animate-fade"
        >
          {normalized.length === 0 ? (
            <li className="cs-option cs-option--empty">No options</li>
          ) : normalized.map((opt, i) => {
            const isSelected = String(opt.value) === String(value);
            const isFocused = i === focusIdx;
            return (
              <li
                key={opt.value}
                role="option"
                data-option
                aria-selected={isSelected}
                className={`cs-option ${isSelected ? 'cs-option--selected' : ''} ${isFocused ? 'cs-option--focused' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                  setFocusIdx(-1);
                }}
                onMouseEnter={() => setFocusIdx(i)}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={12} className="cs-option-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
