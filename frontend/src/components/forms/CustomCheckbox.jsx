import { useId } from 'react';
import { Check } from 'lucide-react';

/**
 * CustomCheckbox — Animated checkbox with smooth checkmark animation
 *
 * Props:
 *   checked   - bool
 *   onChange  - (e) => void  (native event, to be compatible with existing handlers)
 *   label     - string | ReactNode  (optional label)
 *   disabled  - bool
 *   id        - string (optional)
 *   className - string (optional)
 */
export default function CustomCheckbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}) {
  const uid = useId();
  const checkId = id || uid;

  return (
    <label
      htmlFor={checkId}
      className={`cb-root ${disabled ? 'cb-root--disabled' : ''} ${className}`}
    >
      <div className="cb-track-wrap">
        <input
          type="checkbox"
          id={checkId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="cb-native"
        />
        <div className={`cb-box ${checked ? 'cb-box--checked' : ''}`}>
          {checked && <Check size={10} strokeWidth={3} className="cb-check-icon" />}
        </div>
      </div>
      {label && <span className="cb-label">{label}</span>}
    </label>
  );
}
