import { useId, useState } from 'react';
import { groupDigits } from './money';

type InlineNumberProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  /** 沒有聚焦時加上千分位；打字時顯示原始數字，游標才不會亂跳。 */
  grouped?: boolean;
};

/** 嵌在句子裡的數字欄：只收數字，寬度跟著內容長。 */
export function InlineNumber({ label, value, placeholder, onChange, grouped }: InlineNumberProps) {
  const [editing, setEditing] = useState(false);
  const shown = grouped && !editing ? groupDigits(value) : value;

  return (
    <input
      className="inline-number"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={label}
      value={shown}
      placeholder={placeholder}
      onFocus={() => setEditing(true)}
      onBlur={() => setEditing(false)}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      style={{ width: `${Math.max(shown.length, placeholder.length) + 0.9}ch` }}
    />
  );
}

type SegmentedProps<T extends string> = {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** 一排互斥的選項。底下是原生 radio，方向鍵和螢幕閱讀器都照常運作。 */
export function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const name = useId();

  return (
    <fieldset className="segmented">
      <legend className="visually-hidden">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="segment">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

type StepperProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export function Stepper({ label, value, unit, min, max, onChange }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Fewer ${unit}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8h10" />
        </svg>
      </button>
      <output aria-live="polite">
        {value} {value === 1 ? unit.replace(/s$/, '') : unit}
      </output>
      <button
        type="button"
        aria-label={`More ${unit}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8h10M8 3v10" />
        </svg>
      </button>
    </div>
  );
}
