import React from 'react';
import type { AstrologyDetails } from '../lib/astrologyEngine';

interface AstrologyTableProps {
  details: AstrologyDetails;
}

const planetSymbols: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
};

const signLordSymbols: Record<number, { sign: string, lord: string }> = {
  0: { sign: '♈', lord: '♂' }, // Aries (Mars)
  1: { sign: '♉', lord: '♀' }, // Taurus (Venus)
  2: { sign: '♊', lord: '☿' }, // Gemini (Mercury)
  3: { sign: '♋', lord: '☽' }, // Cancer (Moon)
  4: { sign: '♌', lord: '☉' }, // Leo (Sun)
  5: { sign: '♍', lord: '☿' }, // Virgo (Mercury)
  6: { sign: '♎', lord: '♀' }, // Libra (Venus)
  7: { sign: '♏', lord: '♂' }, // Scorpio (Mars)
  8: { sign: '♐', lord: '♃' }, // Sagittarius (Jupiter)
  9: { sign: '♑', lord: '♄' }, // Capricorn (Saturn)
  10: { sign: '♒', lord: '♄' }, // Aquarius (Saturn)
  11: { sign: '♓', lord: '♃' }, // Pisces (Jupiter)
};

export const AstrologyTable: React.FC<AstrologyTableProps> = ({ details }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Planetary Nakshatra Table</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider border-b border-slate-300 dark:border-slate-700">
              <th className="p-2 sm:p-3 font-semibold text-left">Planet Name</th>
              <th className="p-2 sm:p-3 font-semibold text-center">Symbol</th>
              <th className="p-2 sm:p-3 font-semibold text-left">Nakshatra</th>
              <th className="p-2 sm:p-3 font-semibold text-center">Pada</th>
              <th className="p-2 sm:p-3 font-semibold text-center">Sign / Lord</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
            {details.planets.map((planet, idx) => {
              const symbols = signLordSymbols[planet.sign];
              return (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="p-2 sm:p-3 font-medium text-slate-800 dark:text-slate-200">{planet.name}</td>
                  <td className="p-2 sm:p-3 text-center text-base sm:text-lg text-slate-700 dark:text-slate-300">{planetSymbols[planet.name] || '-'}</td>
                  <td className="p-2 sm:p-3 text-slate-600 dark:text-slate-400">{planet.nakshatra || '-'}</td>
                  <td className="p-2 sm:p-3 text-center text-slate-600 dark:text-slate-400">{planet.pada || '-'}</td>
                  <td className="p-2 sm:p-3 text-center text-sm sm:text-base text-slate-600 dark:text-slate-400" title={`Sign: ${symbols?.sign} | Lord: ${symbols?.lord}`}>
                    {symbols ? `${symbols.sign} (${symbols.lord})` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-300 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wider">
              Birth Nakshatra
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {details.birthNakshatra}
            </div>
          </div>
          <div className="flex-1 sm:text-right">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wider">
              Vimshottari Dasa
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Balance Maha Dasa: {details.dashaBalance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
