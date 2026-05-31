use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec![
    Migration {
      version: 1,
      description: "create_initial_tables",
      sql: "CREATE TABLE IF NOT EXISTS saved_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        birth_time TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );",
      kind: MigrationKind::Up,
    }
  ];

  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:astrology_app.db", migrations).build())
    .plugin(tauri_plugin_log::Builder::new().level(log::LevelFilter::Info).build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
