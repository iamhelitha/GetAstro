import React, { useEffect, useState } from 'react';
import { getProfiles, deleteProfile } from '../lib/db';
import type { Profile } from '../lib/db';
import { Trash2, UserCircle, Clock } from 'lucide-react';

interface ProfileManagerProps {
  onSelectProfile: (profile: Profile) => void;
  refreshTrigger: number;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ onSelectProfile, refreshTrigger }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, [refreshTrigger]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteProfile(id);
      await loadProfiles();
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-indigo-500" />
          Saved Profiles
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-sm text-slate-500 text-center py-4">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-8">No saved profiles yet.</div>
        ) : (
          profiles.map(profile => (
            <div 
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className="group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-800 dark:text-white truncate pr-2">
                  {profile.name}
                </h4>
                <button 
                  onClick={(e) => handleDelete(e, profile.id)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{profile.birth_date} • {profile.birth_time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
