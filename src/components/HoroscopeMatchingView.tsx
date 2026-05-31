import React, { useState, useEffect } from 'react';
import { getProfiles } from '../lib/db';
import type { Profile } from '../lib/db';
import { calculateMatching } from '../lib/astrologyEngine';

interface MatchResultState {
  ashtakoot: {
    totalScore: number;
    kootas: Array<{ name: string; score: number; maxScore: number; description: string; area: string }>;
  };
  dosha: {
    boy: { hasDosha: boolean; isHigh: boolean; description: string };
    girl: { hasDosha: boolean; isHigh: boolean; description: string };
  };
  verdict: string;
}

type InputMode = 'saved' | 'manual';

interface ManualEntry {
  name: string;
  dd: string;
  mm: string;
  yyyy: string;
  time: string;
  lat: string;
  lng: string;
}

const emptyManual = (): ManualEntry => ({ name: '', dd: '', mm: '', yyyy: '', time: '', lat: '6.9271', lng: '79.8612' });

const manualToProfile = (m: ManualEntry): Profile | null => {
  const d = parseInt(m.dd), mo = parseInt(m.mm), y = parseInt(m.yyyy);
  if (!m.name || !d || !mo || !y || !m.time || !m.lat || !m.lng) return null;
  if (d < 1 || d > 31 || mo < 1 || mo > 12 || y < 1000) return null;
  return {
    id: crypto.randomUUID(),
    name: m.name,
    birth_date: `${y.toString().padStart(4,'0')}-${mo.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`,
    birth_time: m.time,
    latitude: parseFloat(m.lat),
    longitude: parseFloat(m.lng),
  };
};

// Reusable inline manual entry fields
const ManualFields: React.FC<{ label: string; value: ManualEntry; onChange: (v: ManualEntry) => void }> = ({ label, value, onChange }) => {
  const set = (k: keyof ManualEntry, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
      <input
        type="text" placeholder="Name" value={value.name}
        onChange={e => set('name', e.target.value)}
        className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-none dark:bg-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-slate-500"
      />
      <div className="flex items-center gap-1">
        <input type="text" placeholder="DD" value={value.dd}
          onChange={e => set('dd', e.target.value.replace(/\D/g,'').slice(0,2))}
          className="w-full px-1.5 py-1 text-xs text-center border border-slate-300 dark:border-slate-700 rounded-none dark:bg-slate-800 dark:text-white outline-none"
        />
        <span className="text-slate-400 text-xs">/</span>
        <input type="text" placeholder="MM" value={value.mm}
          onChange={e => set('mm', e.target.value.replace(/\D/g,'').slice(0,2))}
          className="w-full px-1.5 py-1 text-xs text-center border border-slate-300 dark:border-slate-700 rounded-none dark:bg-slate-800 dark:text-white outline-none"
        />
        <span className="text-slate-400 text-xs">/</span>
        <input type="text" placeholder="YYYY" value={value.yyyy}
          onChange={e => set('yyyy', e.target.value.replace(/\D/g,'').slice(0,4))}
          className="w-full px-1.5 py-1 text-xs text-center border border-slate-300 dark:border-slate-700 rounded-none dark:bg-slate-800 dark:text-white outline-none"
        />
      </div>
      <input type="time" value={value.time}
        onChange={e => set('time', e.target.value)}
        className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-none dark:bg-slate-800 dark:text-white outline-none"
      />
      <div className="grid grid-cols-2 gap-1">
        <input type="number" step="any" placeholder="Lat" value={value.lat}
          onChange={e => set('lat', e.target.value)}
          className="w-full px-1.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-none dark:bg-slate-800 dark:text-white outline-none"
        />
        <input type="number" step="any" placeholder="Lng" value={value.lng}
          onChange={e => set('lng', e.target.value)}
          className="w-full px-1.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-none dark:bg-slate-800 dark:text-white outline-none"
        />
      </div>
    </div>
  );
};

export const HoroscopeMatchingView: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [modeA, setModeA] = useState<InputMode>('manual');
  const [modeB, setModeB] = useState<InputMode>('manual');
  const [profileAId, setProfileAId] = useState<string>('');
  const [profileBId, setProfileBId] = useState<string>('');
  const [manualA, setManualA] = useState<ManualEntry>(emptyManual());
  const [manualB, setManualB] = useState<ManualEntry>(emptyManual());
  const [result, setResult] = useState<MatchResultState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfiles()
      .then(p => setProfiles(p))
      .catch(() => { /* profiles unavailable — manual only */ });
  }, []);

  const resolveProfile = (mode: InputMode, id: string, manual: ManualEntry): Profile | null => {
    if (mode === 'saved') return profiles.find(p => p.id === id) || null;
    return manualToProfile(manual);
  };

  const handleCalculate = () => {
    const boyProfile = resolveProfile(modeA, profileAId, manualA);
    const girlProfile = resolveProfile(modeB, profileBId, manualB);
    if (!boyProfile || !girlProfile) {
      setError('Please fill in all required fields for both profiles.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { matchResult, boyDosha, girlDosha } = calculateMatching(boyProfile, girlProfile);
      setResult({
        ashtakoot: matchResult?.ashtakoot ?? { totalScore: 0, kootas: [] },
        dosha: {
          boy: boyDosha ?? { hasDosha: false, isHigh: false, description: 'N/A' },
          girl: girlDosha ?? { hasDosha: false, isHigh: false, description: 'N/A' },
        },
        verdict: matchResult?.verdict ?? 'No verdict available.',
      });
    } catch {
      setError('Matching calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const profileAName = modeA === 'saved' ? (profiles.find(p => p.id === profileAId)?.name ?? 'Male') : (manualA.name || 'Male');
  const profileBName = modeB === 'saved' ? (profiles.find(p => p.id === profileBId)?.name ?? 'Female') : (manualB.name || 'Female');

  const ModeToggle: React.FC<{ mode: InputMode; setMode: (m: InputMode) => void }> = ({ mode, setMode }) => (
    <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 mb-2">
      <button type="button" onClick={() => setMode('manual')}
        className={`flex-1 px-2 py-0.5 text-[10px] font-semibold transition-colors ${mode === 'manual' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-500' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}
      >Manual</button>
      <button type="button" onClick={() => setMode('saved')}
        className={`flex-1 px-2 py-0.5 text-[10px] font-semibold transition-colors ${mode === 'saved' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-500' : 'text-slate-500 hover:text-slate-700 border border-transparent'}`}
      >Saved</button>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-none shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="p-3 sm:p-4 border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Horoscope Matching (Porondam)
        </h2>
      </div>

      {/* Profile Input */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Profile A */}
          <div className="border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Profile A (Male)</div>
            <ModeToggle mode={modeA} setMode={setModeA} />
            {modeA === 'saved' ? (
              <select value={profileAId} onChange={e => setProfileAId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-200 p-1.5 rounded-none focus:outline-none focus:border-slate-500"
              >
                <option value="">— select profile —</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <ManualFields label="" value={manualA} onChange={setManualA} />
            )}
          </div>

          {/* Profile B */}
          <div className="border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Profile B (Female)</div>
            <ModeToggle mode={modeB} setMode={setModeB} />
            {modeB === 'saved' ? (
              <select value={profileBId} onChange={e => setProfileBId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-200 p-1.5 rounded-none focus:outline-none focus:border-slate-500"
              >
                <option value="">— select profile —</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <ManualFields label="" value={manualB} onChange={setManualB} />
            )}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="mt-3 w-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-none hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Calculating…' : 'Calculate Match'}
        </button>

        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="flex-1 overflow-y-auto">
          {/* Mangal Dosha Alerts */}
          <div className="grid grid-cols-2 gap-0 border-b border-slate-200 dark:border-slate-700">
            <div
              className={`p-3 border-r border-slate-200 dark:border-slate-700 ${
                result.dosha.boy.hasDosha
                  ? result.dosha.boy.isHigh
                    ? 'bg-red-50 dark:bg-red-900/10'
                    : 'bg-amber-50 dark:bg-amber-900/10'
                  : 'bg-slate-50 dark:bg-slate-800/30'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mangal Dosha — {profileAName}
              </div>
              <div
                className={`text-xs font-semibold ${
                  result.dosha.boy.hasDosha
                    ? result.dosha.boy.isHigh
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-amber-700 dark:text-amber-400'
                    : 'text-green-700 dark:text-green-400'
                }`}
              >
                {result.dosha.boy.hasDosha
                  ? result.dosha.boy.isHigh
                    ? 'HIGH DOSHA'
                    : 'MILD DOSHA'
                  : 'NO DOSHA'}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {result.dosha.boy.description}
              </p>
            </div>
            <div
              className={`p-3 ${
                result.dosha.girl.hasDosha
                  ? result.dosha.girl.isHigh
                    ? 'bg-red-50 dark:bg-red-900/10'
                    : 'bg-amber-50 dark:bg-amber-900/10'
                  : 'bg-slate-50 dark:bg-slate-800/30'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mangal Dosha — {profileBName}
              </div>
              <div
                className={`text-xs font-semibold ${
                  result.dosha.girl.hasDosha
                    ? result.dosha.girl.isHigh
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-amber-700 dark:text-amber-400'
                    : 'text-green-700 dark:text-green-400'
                }`}
              >
                {result.dosha.girl.hasDosha
                  ? result.dosha.girl.isHigh
                    ? 'HIGH DOSHA'
                    : 'MILD DOSHA'
                  : 'NO DOSHA'}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {result.dosha.girl.description}
              </p>
            </div>
          </div>

          {/* Koota Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-300 dark:border-slate-700">
                  <th className="p-2 font-semibold text-left">Koota</th>
                  <th className="p-2 font-semibold text-center">Score</th>
                  <th className="p-2 font-semibold text-left">Area</th>
                  <th className="p-2 font-semibold text-left hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {result.ashtakoot.kootas.map((koota, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{koota.name}</td>
                    <td className="p-2 text-center">
                      <span
                        className={`font-bold ${
                          koota.score === koota.maxScore
                            ? 'text-green-700 dark:text-green-400'
                            : koota.score === 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {koota.score}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">/{koota.maxScore}</span>
                    </td>
                    <td className="p-2 text-slate-500 dark:text-slate-400">{koota.area}</td>
                    <td className="p-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{koota.description}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-400 dark:border-slate-600">
                  <td className="p-2 font-bold text-sm text-slate-800 dark:text-slate-200">Total</td>
                  <td className="p-2 text-center font-bold text-sm text-slate-900 dark:text-slate-100">
                    {result.ashtakoot.totalScore}
                    <span className="text-slate-400 dark:text-slate-500 font-normal">/36</span>
                  </td>
                  <td className="p-2" colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verdict */}
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-300 dark:border-slate-700">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Verdict
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {result.verdict}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Enter or select two profiles and calculate to view matching results.
          </p>
        </div>
      )}
    </div>
  );
};
