use std::fs;
use std::path::Path;
use tauri::command;
use crate::vector_store::{VectorStore, index_directory};
use crate::embedding::{EmbeddingService, SearchResult};

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

#[command]
pub async fn index_directory_command(directory_path: String) -> Result<String, String> {
    let vector_store = VectorStore::new("file_index")
        .await
        .map_err(|e| format!("Failed to initialize vector store: {}", e))?;
    
    let embedding_service = EmbeddingService::new();
    
    let embedding_fn = |content: &str| -> anyhow::Result<Vec<f32>> {
        // Use the embedding service
        tokio::runtime::Handle::current().block_on(async {
            embedding_service.get_embedding(content).await
        })
    };
    
    index_directory(&vector_store, &directory_path, embedding_fn)
        .await
        .map_err(|e| format!("Failed to index directory: {}", e))?;
    
    Ok("Directory indexed successfully".to_string())
}

#[command]
pub async fn search_files_command(query: String, top_k: Option<usize>) -> Result<Vec<SearchResult>, String> {
    let vector_store = VectorStore::new("file_index")
        .await
        .map_err(|e| format!("Failed to initialize vector store: {}", e))?;
    
    let embedding_service = EmbeddingService::new();
    
    // Generate embedding for the query
    let query_embedding = embedding_service
        .get_embedding(&query)
        .await
        .map_err(|e| format!("Failed to generate embedding: {}", e))?;
    
    let limit = top_k.unwrap_or(10) as u64;
    let search_results = vector_store
        .search_similar_files(query_embedding, limit)
        .await
        .map_err(|e| format!("Search failed: {}", e))?;
    
    // Convert to frontend format
    let results = search_results
        .into_iter()
        .map(|result| SearchResult {
            path: result.file_path,
            snippet: truncate_content(&result.content, 100),
            score: result.score,
        })
        .collect();
    
    Ok(results)
}

fn truncate_content(content: &str, max_length: usize) -> String {
    if content.len() <= max_length {
        content.to_string()
    } else {
        let truncated = &content[..max_length];
        format!("{}...", truncated)
    }
}
 