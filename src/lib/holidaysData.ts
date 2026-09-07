import type { HolidayEntry } from '../types';

// Public holiday presets by city and year.
// Add more cities/years here freely; the Settings screen lists whatever is declared.
export const HOLIDAY_PRESETS: Record<string, Record<string, HolidayEntry[]>> = {
  Barcelona: {
    '2026': [
      { date: '2026-01-01', name: 'Año Nuevo' },
      { date: '2026-01-06', name: 'Reyes' },
      { date: '2026-04-03', name: 'Viernes Santo' },
      { date: '2026-04-06', name: 'Lunes de Pascua Florida' },
      { date: '2026-05-01', name: 'Fiesta del Trabajo' },
      { date: '2026-05-25', name: 'Lunes de Pascua Granada' },
      { date: '2026-06-24', name: 'San Juan' },
      { date: '2026-08-15', name: 'La Asunción' },
      { date: '2026-09-11', name: 'Diada Nacional de Cataluña' },
      { date: '2026-09-24', name: 'Mare de Déu de la Mercè' },
      { date: '2026-10-12', name: 'Día Nacional de España' },
      { date: '2026-12-08', name: 'La Inmaculada' },
      { date: '2026-12-25', name: 'Navidad' },
      { date: '2026-12-26', name: 'San Esteban' },
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
