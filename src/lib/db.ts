import Database from '@tauri-apps/plugin-sql';

export interface Profile {
  id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM
  latitude: number;
  longitude: number;
  created_at?: string;
}

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:astrology_app.db');
  }
  return dbInstance;
}

export async function saveProfile(profile: Profile): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT OR REPLACE INTO saved_profiles (id, name, birth_date, birth_time, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6)',
    [profile.id, profile.name, profile.birth_date, profile.birth_time, profile.latitude, profile.longitude]
  );
}

export async function getProfiles(): Promise<Profile[]> {
  const db = await getDb();
  return await db.select<Profile[]>('SELECT * FROM saved_profiles ORDER BY created_at DESC');
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM saved_profiles WHERE id = $1', [id]);
}
