import React, { useState, useEffect } from 'react';
import { getAstroCalendarEvents } from '../lib/astrologyEngine';

interface AstroCalendarProps {
  latitude?: number;
  longitude?: number;
}

interface Festival {
  name: string;
  date: Date | string;
  type: string;
  category: string;
}

interface GroupedEvents {
  monthKey: string;
  label: string;
  events: Array<Festival & { dateObj: Date }>;
}

const DEFAULT_LAT = 6.9271;
const DEFAULT_LNG = 79.8612;

const PROMINENT_KEYWORDS = ['purnima', 'amavasya', 'ekadashi', 'sankranti'];

const isProminent = (name: string): boolean =>
  PROMINENT_KEYWORDS.some((kw) => name.toLowerCase().includes(kw));

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatDate = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTH_NAMES[d.getMonth()]?.slice(0, 3) ?? '???';
  return `${day} ${mon}`;
};

const categoryColor = (cat: string): string => {
  const c = cat?.toLowerCase() ?? '';
  if (c.includes('lunar')) return 'bg-slate-600 dark:bg-slate-400 text-white dark:text-slate-900';
  if (c.includes('solar') || c.includes('sankranti')) return 'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-900';
  if (c.includes('festival') || c.includes('hindu')) return 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900';
  return 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200';
};

export const AstroCalendarView: React.FC<AstroCalendarProps> = ({
  latitude,
  longitude,
}) => {
  const lat = latitude ?? DEFAULT_LAT;
  const lng = longitude ?? DEFAULT_LNG;

  const [grouped, setGrouped] = useState<GroupedEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const raw = getAstroCalendarEvents(new Date(), lat, lng, 90) as Festival[];
      if (!raw || !Array.isArray(raw)) {
        setGrouped([]);
        setLoading(false);
        return;
      }

      // Normalize dates and sort
      const normalized = raw
        .map((f) => {
          const dateObj = f.date instanceof Date ? f.date : new Date(f.date);
          return { ...f, dateObj };
        })
        .filter((f) => !isNaN(f.dateObj.getTime()))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      // Group by month
      const map = new Map<string, GroupedEvents>();
      for (const evt of normalized) {
        const key = `${evt.dateObj.getFullYear()}-${String(evt.dateObj.getMonth()).padStart(2, '0')}`;
        if (!map.has(key)) {
          map.set(key, {
            monthKey: key,
            label: `${MONTH_NAMES[evt.dateObj.getMonth()]} ${evt.dateObj.getFullYear()}`,
            events: [],
          });
        }
        map.get(key)!.events.push(evt);
      }

      setGrouped(Array.from(map.values()));
    } catch {
      setError('Failed to fetch calendar events.');
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  const totalEvents = grouped.reduce((sum, g) => sum + g.events.length, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-none shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="p-3 sm:p-4 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Astro Calendar
        </h2>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {totalEvents} events · 90 days
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">Loading events…</p>
          </div>
        )}

        {error && (
          <div className="p-4">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && grouped.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">No events found.</p>
          </div>
        )}

        {!loading &&
          !error &&
          grouped.map((group) => (
            <div key={group.monthKey}>
              {/* Month Header */}
              <div className="sticky top-0 z-10 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {group.label}
                </span>
              </div>

              {/* Events */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.events.map((evt, idx) => {
                  const prominent = isProminent(evt.name);
                  return (
                    <div
                      key={`${group.monthKey}-${idx}`}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                        prominent ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''
                      }`}
                    >
                      {/* Date */}
                      <div className="w-14 shrink-0 text-right">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {formatDate(evt.dateObj)}
                        </span>
                      </div>

                      {/* Prominence marker */}
                      <div className="w-1 shrink-0 self-stretch">
                        {prominent && (
                          <div className="w-full h-full bg-slate-700 dark:bg-slate-300" />
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs truncate block ${
                            prominent
                              ? 'font-bold text-slate-900 dark:text-slate-100'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {evt.name}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1 shrink-0">
                        {evt.type && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {evt.type}
                          </span>
                        )}
                        {evt.category && (
                          <span
                            className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${categoryColor(
                              evt.category
                            )}`}
                          >
                            {evt.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
