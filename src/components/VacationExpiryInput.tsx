const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Day + month pickers for an 'MM-DD' value (the year is always "next year"). */
export function VacationExpiryInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  const [m, d] = /^\d{2}-\d{2}$/.test(value) ? value.split('-').map(Number) : [2, 28];
  // Day list follows the month; February offers 29 (treated as the 28th outside leap years).
  const daysIn = new Date(2024, m, 0).getDate();
  return (
    <fieldset className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
      <legend className="mb-1">Expire on (next year)</legend>
      <div className="flex gap-2">
        <select aria-label="Expiry day" value={Math.min(d, daysIn)} onChange={(e) => onChange(`${pad(m)}-${pad(Number(e.target.value))}`)} className={className}>
          {Array.from({ length: daysIn }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <select
          aria-label="Expiry month"
          value={m}
          onChange={(e) => {
            const month = Number(e.target.value);
            onChange(`${pad(month)}-${pad(Math.min(d, new Date(2024, month, 0).getDate()))}`);
          }}
          className={className}
        >
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
