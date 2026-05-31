import React from 'react';
import type { PlanetPosition } from '../lib/astrologyEngine';

interface KotuGridProps {
  lagnaSign: number;
  planets: PlanetPosition[];
  chartType: "RASI CHART" | "NAWANSA";
}

const signNames = [
  "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
  "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)",
  "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
];

const gridMapping = [
  [11, 0, 1, 2],
  [10, -1, -1, 3],
  [9, -1, -1, 4],
  [8, 7, 6, 5]
];

export const KotuGrid: React.FC<KotuGridProps> = ({ lagnaSign, planets, chartType }) => {
  const lagnaSignName = signNames[lagnaSign]?.split(' ')[0] || "Unknown";

  return (
    <div className="w-full max-w-2xl mx-auto aspect-square border border-slate-700 dark:border-slate-500 grid grid-cols-4 grid-rows-4 bg-white dark:bg-slate-900 rounded-none overflow-hidden">
      {gridMapping.flat().map((signIndex, i) => {
        if (signIndex === -1) {
          return (
            <div key={i} className="flex items-center justify-center p-4">
              {i === 5 && (
                <div className="text-center w-[200%] h-[200%] flex flex-col items-center justify-center pointer-events-none z-10">
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-800 dark:text-slate-200">
                    {lagnaSignName}
                  </h1>
                  <h2 className="text-sm md:text-lg tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                    {chartType}
                  </h2>
                </div>
              )}
            </div>
          );
        }

        const isLagna = signIndex === lagnaSign;
        const planetsHere = planets.filter(p => p.sign === signIndex);

        return (
          <div 
            key={i} 
            className="border border-slate-300 dark:border-slate-700 p-2 flex flex-col relative transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1">
              {signNames[signIndex].split(' ')[0]}
            </div>
            {isLagna && (
              <div className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-none text-[10px] border border-slate-400">
                1
              </div>
            )}
            <div className="flex-1 flex flex-col gap-px content-start mt-1 overflow-y-auto">
              {planetsHere.map((p, idx) => (
                <span 
                  key={idx} 
                  className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-[10px] sm:text-xs font-semibold rounded-none border border-slate-200 dark:border-slate-700 truncate"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
