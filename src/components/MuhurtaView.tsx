import React from 'react';
import type { AstrologyDetails } from '../lib/astrologyEngine';
import { AlertCircle } from 'lucide-react';

interface MuhurtaViewProps {
  details: AstrologyDetails;
}

export const MuhurtaView: React.FC<MuhurtaViewProps> = ({ details }) => {
  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isBirthTimeInBlock = (start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const bTime = details.birthDateObj.getTime();
    return bTime >= start.getTime() && bTime <= end.getTime();
  };

  const kalams = [
    {
      name: 'Rahu Kalam',
      start: details.muhurta.rahuKalamStart,
      end: details.muhurta.rahuKalamEnd,
      desc: 'Inauspicious for new beginnings.'
    },
    {
      name: 'Yamaganda Kalam',
      start: details.muhurta.yamagandaKalamStart,
      end: details.muhurta.yamagandaKalamEnd,
      desc: 'Inauspicious, indicates obstacles.'
    },
    {
      name: 'Gulika Kalam',
      start: details.muhurta.gulikaKalamStart,
      end: details.muhurta.gulikaKalamEnd,
      desc: 'Associated with delays.'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-none shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="p-3 sm:p-4 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Muhurta & Kalams</h2>
      </div>

      <div className="p-4 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-lg">
          These are daily inauspicious time blocks calculated for the specific location and date of birth. 
          A warning indicator appears if the birth time falls exactly within one of these windows.
        </p>

        <div className="space-y-3">
          {kalams.map((kalam, idx) => {
            const isMatch = isBirthTimeInBlock(kalam.start, kalam.end);
            return (
              <div 
                key={idx} 
                className={`p-3 border rounded-none flex items-center justify-between transition-colors ${
                  isMatch 
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800/50' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${isMatch ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {kalam.name}
                    </h3>
                    {isMatch && <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{kalam.desc}</p>
                </div>
                <div className={`text-xs font-semibold ${isMatch ? 'text-red-800 dark:text-red-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {formatTime(kalam.start)} - {formatTime(kalam.end)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
