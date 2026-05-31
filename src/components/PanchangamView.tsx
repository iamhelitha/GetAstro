import React from 'react';
import type { AstrologyDetails } from '../lib/astrologyEngine';

interface PanchangamViewProps {
  details: AstrologyDetails;
}

export const PanchangamView: React.FC<PanchangamViewProps> = ({ details }) => {
  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-none shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="p-3 sm:p-4 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Panchangam & Astronomy</h2>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Basic Panchangam Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Core Panchangam</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs sm:text-sm">
              <div className="text-slate-500 dark:text-slate-400 font-semibold">Tithi</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">
                {details.tithiInfo.name} <span className="text-[10px] text-slate-500 ml-1">({details.tithiInfo.paksha} Paksha)</span>
              </div>

              <div className="text-slate-500 dark:text-slate-400 font-semibold">Yoga</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">{details.yogaInfo.name}</div>

              <div className="text-slate-500 dark:text-slate-400 font-semibold">Karana</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">{details.karanaName}</div>

              <div className="text-slate-500 dark:text-slate-400 font-semibold">Vara (Day)</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">{details.varaName}</div>
            </div>
          </div>
        </div>

        {/* Celestial Times */}
        <div className="space-y-4 md:border-l md:border-slate-200 dark:md:border-slate-700 md:pl-6">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Celestial Times</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs sm:text-sm">
              <div className="text-slate-500 dark:text-slate-400 font-semibold">Sunrise</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">{formatTime(details.sunMoonTimes.sunrise)}</div>

              <div className="text-slate-500 dark:text-slate-400 font-semibold">Sunset</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">{formatTime(details.sunMoonTimes.sunset)}</div>

              <div className="text-slate-500 dark:text-slate-400 font-semibold">Moonrise</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">{formatTime(details.sunMoonTimes.moonrise)}</div>

              <div className="text-slate-500 dark:text-slate-400 font-semibold">Moonset</div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">{formatTime(details.sunMoonTimes.moonset)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
