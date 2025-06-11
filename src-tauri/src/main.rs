// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod vector_store;
mod commands;

use commands::{index_directory_command, search_files_command};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            index_directory_command,
            search_files_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

