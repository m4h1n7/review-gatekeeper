import { useState } from "react";

/**
 * Opt-in consent checkbox for forms that collect personal data
 * (lead generation, customer feedback, payment verification).
 *
 * Deliberately unchecked by default and required by default: consent must be
 * an affirmative action, never pre-ticked.
 */

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Show the "required" error state. */
  showError?: boolean;
  /** Text colour for the label, to match the surrounding form's theme. */
  className?: string;
  labelClassName?: string;
  /** Accent colour used for the checked box and links. */
  accentColor?: string;
  /** Hide the "(Required)" hint when space is tight. */
  compact?: boolean;
}

export function ConsentCheckbox({
  checked,
  onChange,
  showError = false,
  className = "",
  labelClassName = "text-[11px] text-white/35",
  accentColor = "#16A34A",
  compact = false,
}: ConsentCheckboxProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={className}>
      <label
        className={`flex items-start gap-2.5 cursor-pointer select-none ${
          showError ? "text-red-400" : labelClassName
        }`}
      >
        <span className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required
            aria-invalid={showError}
            className="sr-only"
          />
          <span
            role="checkbox"
            aria-checked={checked}
            tabIndex={-1}
            className={`w-4 h-4 rounded-[5px] border transition-all duration-200 flex items-center justify-center ${
              checked ? "border-transparent" : showError ? "border-red-400/60 bg-white/[0.03]" : "border-white/15 bg-white/[0.03]"
            } ${focused ? "ring-2 ring-white/20" : ""}`}
            style={checked ? { backgroundColor: accentColor } : undefined}
          >
            {checked && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </span>
        </span>

        <span className={`leading-relaxed ${compact ? "text-[10px]" : ""}`}>
          I agree to the{" "}
          <a href="/terms" target="_blank" rel="noreferrer" className="underline hover:opacity-80" style={{ color: accentColor }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noreferrer" className="underline hover:opacity-80" style={{ color: accentColor }}>
            Privacy Policy
          </a>
          , and consent to my details being stored and used to respond to my feedback.
          {!compact && <span className="ml-1 text-[10px] opacity-60">(Required)</span>}
        </span>
      </label>

      {showError && (
        <p className="text-[10px] text-red-400 mt-1 ml-7">Please agree before submitting.</p>
      )}
    </div>
  );
}

export default ConsentCheckbox;
