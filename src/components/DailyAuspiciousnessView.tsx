import React, { useState, useEffect, useCallback } from 'react';
import type { AstrologyDetails } from '../lib/astrologyEngine';
import { getDailyAuspiciousness } from '../lib/astrologyEngine';

interface DailyAuspiciousnessProps {
  details: AstrologyDetails;
  latitude?: number;
  longitude?: number;
}

interface TarabalamInfo {
  taraName: string;
  isAuspicious: boolean;
  description: string;
  birthNakshatraName: string;
  currentNakshatraName: string;
}

interface ChandrashtamaInfo {
  isActive: boolean;
  description: string;
}

interface DishaShoola {
  direction: string;
  description: string;
}

interface PanchangamResult {
  tarabalam?: TarabalamInfo;
  chandrashtama?: ChandrashtamaInfo;
  dishaShoola?: DishaShoola;
}

const DEFAULT_LAT = 6.9271;
const DEFAULT_LNG = 79.8612;

const formatDateInput = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const DailyAuspiciousnessView: React.FC<DailyAuspiciousnessProps> = ({
  details,
  latitude,
  longitude,
}) => {
  const lat = latitude ?? DEFAULT_LAT;
  const lng = longitude ?? DEFAULT_LNG;

  const [selectedDate, setSelectedDate] = useState<string>(formatDateInput(new Date()));
  const [panchangam, setPanchangam] = useState<PanchangamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    if (!details) return;
    setLoading(true);
    setError(null);
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const targetDate = new Date(y, m - 1, d, 6, 0);
      const result = getDailyAuspiciousness(details, targetDate, lat, lng);
      setPanchangam(result as unknown as PanchangamResult);
    } catch {
      setError('Failed to compute daily auspiciousness.');
      setPanchangam(null);
    } finally {
      setLoading(false);
    }
  }, [details, selectedDate, lat, lng]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tara = panchangam?.tarabalam;
  const chandra = panchangam?.chandrashtama;
  const disha = panchangam?.dishaShoola;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-none shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="p-3 sm:p-4 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Daily Auspiciousness
        </h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-200 p-1 rounded-none focus:outline-none focus:border-slate-500"
        />
      </div>

      <div className="p-4 flex-1 space-y-3">
        {loading && (
          <p className="text-xs text-slate-400 dark:text-slate-500">Computing…</p>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        {!loading && !error && panchangam && (
          <>
            {/* Tarabalam */}
            <div
              className={`p-3 border rounded-none ${
                tara?.isAuspicious
                  ? 'border-green-300 dark:border-green-800/50 bg-green-50 dark:bg-green-900/10'
                  : 'border-red-300 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Tarabalam
              </div>
              {tara ? (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        tara.isAuspicious
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {tara.taraName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 ${
                        tara.isAuspicious
                          ? 'bg-green-200 dark:bg-green-800/40 text-green-800 dark:text-green-300'
                          : 'bg-red-200 dark:bg-red-800/40 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {tara.isAuspicious ? 'Favorable' : 'Unfavorable'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {tara.description}
                  </p>
                  <div className="flex gap-4 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Birth: {tara.birthNakshatraName}</span>
                    <span>Current: {tara.currentNakshatraName}</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Tarabalam data unavailable.
                </p>
              )}
            </div>

            {/* Chandrashtama */}
            <div
              className={`p-3 border rounded-none ${
                chandra?.isActive
                  ? 'border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Chandrashtama
              </div>
              {chandra ? (
                <>
                  <div
                    className={`text-sm font-bold ${
                      chandra.isActive
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-green-700 dark:text-green-400'
                    }`}
                  >
                    {chandra.isActive ? 'ACTIVE — Moon in 8th' : 'Inactive'}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {chandra.description}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Chandrashtama data unavailable.
                </p>
              )}
            </div>

            {/* Disha Shoola */}
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-none bg-white dark:bg-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Disha Shoola
              </div>
              {disha ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Avoid: {disha.direction}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    — {disha.description}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Disha Shoola data unavailable.
                </p>
              )}
            </div>
          </>
        )}

        {!loading && !error && !panchangam && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-8">
            No data available for the selected date.
          </p>
        )}
      </div>
    </div>
  );
};
