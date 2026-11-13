type CurrencyInputProps = {
  id: string;
  label: string;
  // shown after the value, e.g. USDT or BTC
  unit: string;
  value: string;
  onChange: (value: string) => void;
};

export function CurrencyInput({
  id,
  label,
  unit,
  value,
  onChange,
}: CurrencyInputProps) {
  return (
    <div className="currency-input">
      <label htmlFor={id}>{label}</label>
      <div className="currency-input-field">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          aria-describedby={`${id}-unit`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {/* read as the input's description, so the currency is announced */}
        <span id={`${id}-unit`} className="currency-input-unit">
          {unit}
        </span>
      </div>
    </div>
  );
}
