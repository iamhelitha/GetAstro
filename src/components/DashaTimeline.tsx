import React from 'react';
import type { AstrologyDetails } from '../lib/astrologyEngine';

interface DashaTimelineProps {
  details: AstrologyDetails;
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({ details }) => {
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDurationString = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return `${Math.round(diffYears)} Yrs`;
  };

  const now = new Date().getTime();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-none shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="p-3 sm:p-4 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Vimshottari Dasha Timeline</h2>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-sm">
          Balance: {details.dashaBalance}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider border-b border-slate-300 dark:border-slate-700 sticky top-0 z-10">
              <th className="p-2 sm:p-3 font-semibold">Maha Dasa</th>
              <th className="p-2 sm:p-3 font-semibold">Start Date</th>
              <th className="p-2 sm:p-3 font-semibold">End Date</th>
              <th className="p-2 sm:p-3 font-semibold text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
            {details.vimshottariFullCycle.map((dasa, idx) => {
              const isCurrent = now >= dasa.startTime.getTime() && now < dasa.endTime.getTime();
              return (
                <tr 
                  key={idx} 
                  className={`transition-colors ${
                    isCurrent 
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <td className="p-2 sm:p-3 font-bold">
                    {dasa.planet} {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-wider opacity-70">(Active)</span>}
                  </td>
                  <td className="p-2 sm:p-3 opacity-90">{formatDate(dasa.startTime)}</td>
                  <td className="p-2 sm:p-3 opacity-90">{formatDate(dasa.endTime)}</td>
                  <td className="p-2 sm:p-3 text-right opacity-80 font-medium">
                    {getDurationString(dasa.startTime, dasa.endTime)}
                  </td>
                </tr>
              );
            })}
            
            {details.vimshottariFullCycle.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                  Dasha calculation not available for this profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
