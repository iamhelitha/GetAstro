import { useState } from 'react';
import { BirthForm } from './components/BirthForm';
import { KotuGrid } from './components/KotuGrid';
import { AstrologyTable } from './components/AstrologyTable';
import { ProfileManager } from './components/ProfileManager';
import { PanchangamView } from './components/PanchangamView';
import { MuhurtaView } from './components/MuhurtaView';
import { DashaTimeline } from './components/DashaTimeline';
import { HoroscopeMatchingView } from './components/HoroscopeMatchingView';
import { DailyAuspiciousnessView } from './components/DailyAuspiciousnessView';
import { AstroCalendarView } from './components/AstroCalendarView';
import { calculateChart } from './lib/astrologyEngine';
import type { AstrologyDetails } from './lib/astrologyEngine';
import { saveProfile } from './lib/db';
import type { Profile } from './lib/db';
import { MoonStar, Menu, X, LayoutDashboard, Sun, Clock, Calendar, Heart, Sparkles, CalendarDays } from 'lucide-react';

type NavView = 'charts' | 'panchangam' | 'muhurta' | 'dasha' | 'matching' | 'daily' | 'calendar';

function App() {
  const [details, setDetails] = useState<AstrologyDetails | null>(null);
  const [lastProfile, setLastProfile] = useState<Profile | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'D1' | 'D9'>('D1');
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [activeNav, setActiveNav] = useState<NavView>('charts');

  const handleCalculate = async (profile: Profile, shouldSave: boolean) => {
    try {
      if (shouldSave) {
        await saveProfile(profile);
        setRefreshTrigger(prev => prev + 1);
      }
      const calc = calculateChart(
        profile.birth_date,
        profile.birth_time,
        profile.latitude,
        profile.longitude
      );
      setDetails(calc);
      setLastProfile(profile);
      setIsFormVisible(false);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Calculation Error:", error);
      alert("Failed to calculate chart. Ensure input data is valid.");
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    handleCalculate(profile, false);
  };

  const navItems: { id: NavView; label: string; icon: React.ReactNode; needsProfile?: boolean }[] = [
    { id: 'charts', label: 'Birth Charts', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'panchangam', label: 'Panchangam', icon: <Sun className="w-4 h-4" />, needsProfile: true },
    { id: 'muhurta', label: 'Muhurta & Kalams', icon: <Clock className="w-4 h-4" />, needsProfile: true },
    { id: 'dasha', label: 'Dasha Timeline', icon: <Calendar className="w-4 h-4" />, needsProfile: true },
    { id: 'matching', label: 'Porondam (Match)', icon: <Heart className="w-4 h-4" /> },
    { id: 'daily', label: 'Daily Auspicious', icon: <Sparkles className="w-4 h-4" />, needsProfile: true },
    { id: 'calendar', label: 'Astro Calendar', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-800 text-slate-100 z-20 shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg">
          <MoonStar className="w-5 h-5" />
          GetAstro
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-300 dark:border-slate-800 hidden md:flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-slate-200 shrink-0">
          <MoonStar className="w-6 h-6" />
          GetAstro
        </div>

        <nav className="p-2 flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveNav(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-none transition-colors border ${
                activeNav === item.id 
                  ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-100' 
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="h-2/5 border-t border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col shrink-0">
          <ProfileManager onSelectProfile={handleSelectProfile} refreshTrigger={refreshTrigger} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col">
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-4">
          
          {/* Top Config Area — hidden for views that don't need a profile */}
          {activeNav !== 'matching' && activeNav !== 'calendar' && (
            <div className="shrink-0">
              {isFormVisible ? (
                <BirthForm onSubmit={handleCalculate} initialProfile={lastProfile} />
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-none border border-slate-300 dark:border-slate-700 flex justify-between items-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">{lastProfile?.name || 'Profile'}</span>
                    {lastProfile?.birth_date} · {lastProfile?.birth_time}
                  </div>
                  <button 
                    onClick={() => setIsFormVisible(true)} 
                    className="px-3 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-none border border-slate-300 dark:border-slate-500 transition-colors"
                  >
                    Edit / New
                  </button>
                </div>
              )}
            </div>
          )}

          {/* View Rendering */}
          <div className="flex-1">
            {/* Views that need a profile */}
            {activeNav === 'charts' && (
              details ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-300">
                  <div className="xl:col-span-5">
                    <AstrologyTable details={details} />
                  </div>
                  <div className="xl:col-span-7">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <div className="w-1 h-5 bg-slate-500"></div>
                        Charts
                      </h2>
                      <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-none border border-slate-300 dark:border-slate-700">
                        <button 
                          onClick={() => setActiveChartTab('D1')}
                          className={`px-3 py-1 text-xs font-semibold rounded-none transition-all ${activeChartTab === 'D1' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'}`}
                        >
                          Rasi (D-1)
                        </button>
                        <button 
                          onClick={() => setActiveChartTab('D9')}
                          className={`px-3 py-1 text-xs font-semibold rounded-none transition-all ${activeChartTab === 'D9' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'}`}
                        >
                          Nawansa (D-9)
                        </button>
                      </div>
                    </div>
                    {activeChartTab === 'D1' ? (
                      <KotuGrid lagnaSign={details.lagnaSign} planets={details.planets} chartType="RASI CHART" />
                    ) : (
                      <KotuGrid lagnaSign={details.navamsha.lagnaSign} planets={details.navamsha.planets} chartType="NAWANSA" />
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState />
              )
            )}

            {activeNav === 'panchangam' && (details ? <PanchangamView details={details} /> : <EmptyState />)}
            {activeNav === 'muhurta' && (details ? <MuhurtaView details={details} /> : <EmptyState />)}
            {activeNav === 'dasha' && (details ? <DashaTimeline details={details} /> : <EmptyState />)}
            {activeNav === 'daily' && (details ? <DailyAuspiciousnessView details={details} latitude={details.latitude} longitude={details.longitude} /> : <EmptyState />)}

            {/* Views that work independently */}
            {activeNav === 'matching' && <HoroscopeMatchingView />}
            {activeNav === 'calendar' && <AstroCalendarView latitude={details?.latitude} longitude={details?.longitude} />}
          </div>

        </main>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-none bg-slate-50 dark:bg-slate-900/50 p-6 text-center">
      <MoonStar className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-xs font-medium">Enter birth details to generate data for this view.</p>
    </div>
  );
}

export default App;

