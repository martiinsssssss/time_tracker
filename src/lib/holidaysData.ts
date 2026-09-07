import type { HolidayEntry } from '../types';

// Public holiday presets by city and year.
// Add more cities/years here freely; the Settings screen lists whatever is declared.
export const HOLIDAY_PRESETS: Record<string, Record<string, HolidayEntry[]>> = {
  Barcelona: {
    '2026': [
      { date: '2026-01-01', name: "New Year's Day" },
      { date: '2026-01-06', name: 'Epiphany' },
      { date: '2026-04-03', name: 'Good Friday' },
      { date: '2026-04-06', name: 'Easter Monday' },
      { date: '2026-05-01', name: 'Labour Day' },
      { date: '2026-05-25', name: 'Whit Monday' },
      { date: '2026-06-24', name: "Saint John's Day" },
      { date: '2026-08-15', name: 'Assumption Day' },
      { date: '2026-09-11', name: 'National Day of Catalonia' },
      { date: '2026-09-24', name: "La Mercè (Barcelona's Patron Saint Day)" },
      { date: '2026-10-12', name: 'Spanish National Day' },
      { date: '2026-12-08', name: 'Immaculate Conception' },
      { date: '2026-12-25', name: 'Christmas Day' },
      { date: '2026-12-26', name: "St. Stephen's Day" },
    ],
  },
};

export function listPresets(): { city: string; year: string; count: number }[] {
  const out: { city: string; year: string; count: number }[] = [];
  for (const city of Object.keys(HOLIDAY_PRESETS).sort()) {
    const years = HOLIDAY_PRESETS[city];
    for (const year of Object.keys(years).sort()) {
      out.push({ city, year, count: years[year].length });
    }
  }
  return out;
}
