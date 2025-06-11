use anyhow::Result;
use qdrant_client::qdrant::{
    CreateCollectionBuilder, Distance, PointStruct, SearchPoints, VectorParamsBuilder,
    WithPayloadSelector, with_payload_selector::SelectorOptions, Value, UpsertPoints
};
use qdrant_client::Qdrant;
use std::collections::HashMap;
use std::path::Path;
use walkdir::WalkDir;

use crate::commands::read_file_content;

pub struct VectorStore {
    client: Qdrant,
    collection_name: String,
}

impl VectorStore {
    pub async fn new(collection_name: &str) -> Result<Self> {
        // Initialize the Qdrant client
        let client = Qdrant::from_url("http://localhost:6334").build()?;
        
        let store = VectorStore {
            client,
            collection_name: collection_name.to_string(),
        };
        
        // Create collection if it doesn't exist
        store.ensure_collection_exists().await?;
        
        Ok(store)
    }
    
    async fn ensure_collection_exists(&self) -> Result<()> {
        // Try to get collection info, create if it doesn't exist
        match self.client.collection_info(&self.collection_name).await {
            Ok(_) => {
                println!("Collection '{}' already exists", self.collection_name);
            }
            Err(_) => {
                println!("Creating collection '{}'", self.collection_name);
                self.client
                    .create_collection(
                        CreateCollectionBuilder::new(&self.collection_name)
                            .vectors_config(VectorParamsBuilder::new(384, Distance::Cosine)),
                    )
                    .await?;
            }
        }
        Ok(())
    }
    
    pub async fn add_file_embedding(
        &self,
        file_path: &str,
        content: &str,
        embedding: Vec<f32>,
    ) -> Result<()> {
        let payload: HashMap<String, Value> = [
            ("file_path".to_string(), file_path.into()),
            ("content".to_string(), content.into()),
            ("file_name".to_string(), Path::new(file_path).file_name().unwrap().to_string_lossy().to_string().into()),
            ("file_extension".to_string(), Path::new(file_path).extension().unwrap_or_default().to_string_lossy().to_string().into()),
        ].into_iter().collect();
        
        let point = PointStruct::new(
            uuid::Uuid::new_v4().to_string(),
            embedding,
            payload,
        );
        
        self.client
            .upsert_points(UpsertPoints {
                collection_name: self.collection_name.clone(),
                points: vec![point],
                ..Default::default()
            })
            .await?;
            
        Ok(())
    }
    
    pub async fn search_similar_files(&self, query_embedding: Vec<f32>, limit: u64) -> Result<Vec<SearchResult>> {
        let payload_selector = WithPayloadSelector {
            selector_options: Some(SelectorOptions::Enable(true)),
        };
        
        let search_points = SearchPoints {
            collection_name: self.collection_name.clone(),
            vector: query_embedding,
            limit,
            with_payload: Some(payload_selector),
            score_threshold: Some(0.7),
            ..Default::default()
        };
        
        let search_result = self.client.search_points(search_points).await?;
        
        let results: Vec<SearchResult> = search_result
            .result
            .into_iter()
            .map(|point| SearchResult {
                file_path: point.payload.get("file_path")
                    .and_then(|v| v.as_str())
                    .map_or("unknown".to_string(), |v| v.to_string()),
                content: point.payload.get("content")
                    .and_then(|v| v.as_str())
                    .map_or("".to_string(), |v| v.to_string()),
                score: point.score,
            })
            .collect();
            
        Ok(results)
    }
}

pub async fn index_directory(
    vector_store: &VectorStore,
    directory_path: &str,
    embedding_fn: impl Fn(&str) -> Result<Vec<f32>>,
) -> Result<()> {
    println!("Starting to index directory: {}", directory_path);
    
    let mut indexed_count = 0;
    let mut skipped_count = 0;
    
    for entry in WalkDir::new(directory_path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        
        // Skip directories and hidden files
        if path.is_dir() || path.file_name().unwrap().to_string_lossy().starts_with('.') {
            continue;
        }
        
        // Filter for text-based files (adjust extensions as needed)
        let allowed_extensions = vec!["rs", "js", "ts", "py", "md", "txt", "json", "toml", "yaml", "yml"];
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("");
            
        if !allowed_extensions.contains(&extension) {
            skipped_count += 1;
            continue;
        }
        
        let file_path_str = path.to_string_lossy().to_string();
        
        // Read file content using your existing command
        match read_file_content(file_path_str.clone()) {
            Ok(content) => {
                // Skip very large files (adjust size limit as needed)
                if content.len() > 50_000 {
                    println!("Skipping large file: {} ({} bytes)", file_path_str, content.len());
                    skipped_count += 1;
                    continue;
                }
                
                // Generate embedding for the file content
                match embedding_fn(&content) {
                    Ok(embedding) => {
                        if let Err(e) = vector_store.add_file_embedding(&file_path_str, &content, embedding).await {
                            eprintln!("Failed to add embedding for {}: {}", file_path_str, e);
                        } else {
                            indexed_count += 1;
                            println!("Indexed: {}", file_path_str);
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to generate embedding for {}: {}", file_path_str, e);
                        skipped_count += 1;
                    }
                }
            }
            Err(e) => {
                eprintln!("Failed to read file {}: {}", file_path_str, e);
                skipped_count += 1;
            }
        }
    }
    
    println!("Indexing complete! Indexed: {}, Skipped: {}", indexed_count, skipped_count);
    Ok(())
}


#[derive(Debug)]
pub struct SearchResult {
    pub file_path: String,
    pub content: String,
    pub score: f32,
}
