mod commands;
mod vector_store;
mod embedding;

use commands::{list_files, read_file_content, write_file_content, index_directory_command, search_files_command};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .setup(|_app| {
      if cfg!(debug_assertions) {
        // Remove log plugin for now since it's causing issues
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      list_files,
      read_file_content,
      write_file_content,
      index_directory_command,
      search_files_command
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

