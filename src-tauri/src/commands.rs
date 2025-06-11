use std::fs;
use std::path::Path;
use tauri::command;

#[command]
pub fn list_files(path: String) -> Result<Vec<String>, String> {
    let dir_path = Path::new(&path);
    
    if !dir_path.exists() {
        return Err(format!("Path does not exist: {}", path));
    }
    
    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    match fs::read_dir(dir_path) {
        Ok(entries) => {
            let mut files = Vec::new();
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        if let Some(name) = entry.file_name().to_str() {
                            files.push(name.to_string());
                        }
                    }
                    Err(_) => continue,
                }
            }
            files.sort();
            Ok(files)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e))
    }
}

#[command]
pub fn read_file_content(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file {}: {}", path, e))
    }
}

#[command]
pub fn write_file_content(path: String, content: String) -> Result<(), String> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file {}: {}", path, e))
    }
} 

use crate::vector_store::{VectorStore, index_directory};

#[command]
pub async fn index_directory_command(directory_path: String) -> Result<String, String> {
    let vector_store = VectorStore::new("file_index")
        .await
        .map_err(|e| format!("Failed to initialize vector store: {}", e))?;
    
    // You'll need to implement or integrate an embedding function here
    let embedding_fn = |content: &str| -> anyhow::Result<Vec<f32>> {
        // This is a placeholder - you'll need to integrate with an embedding model
        // For example, you could use a local model or call an API
        todo!("Implement embedding generation - consider using sentence-transformers, OpenAI API, or a local model")
    };
    
    index_directory(&vector_store, &directory_path, embedding_fn)
        .await
        .map_err(|e| format!("Failed to index directory: {}", e))?;
    
    Ok("Directory indexed successfully".to_string())
}

#[command]
pub async fn search_files_command(query: String) -> Result<Vec<crate::vector_store::SearchResult>, String> {
    let vector_store = VectorStore::new("file_index")
        .await
        .map_err(|e| format!("Failed to initialize vector store: {}", e))?;
    
    // Generate embedding for the query (you'll need to implement this)
    let query_embedding = todo!("Generate embedding for query");
    
    vector_store.search_similar_files(query_embedding, 10)
        .await
        .map_err(|e| format!("Search failed: {}", e))
}
