use anyhow::Result;
use reqwest::Client;
use serde_json::{json, Value};

pub struct EmbeddingService {
    client: Client,
    api_key: Option<String>,
}

impl EmbeddingService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            api_key: std::env::var("OPENAI_API_KEY").ok(),
        }
    }

    pub async fn get_embedding(&self, text: &str) -> Result<Vec<f32>> {
        if let Some(api_key) = &self.api_key {
            self.get_openai_embedding(text, api_key).await
        } else {
            // Fallback to mock embedding
            Ok(self.generate_mock_embedding(text))
        }
    }

    async fn get_openai_embedding(&self, text: &str, api_key: &str) -> Result<Vec<f32>> {
        let request_body = json!({
            "input": text,
            "model": "text-embedding-3-small"
        });

        let response = self
            .client
            .post("https://api.openai.com/v1/embeddings")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await?;

        if !response.status().is_success() {
            // Fallback to mock if API fails
            return Ok(self.generate_mock_embedding(text));
        }

        let response_json: Value = response.json().await?;
        let embedding = response_json["data"][0]["embedding"]
            .as_array()
            .ok_or_else(|| anyhow::anyhow!("Invalid embedding response"))?
            .iter()
            .map(|v| v.as_f64().unwrap_or(0.0) as f32)
            .collect();

        Ok(embedding)
    }

    fn generate_mock_embedding(&self, text: &str) -> Vec<f32> {
        // Generate a simple hash-based mock embedding for development
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        text.hash(&mut hasher);
        let hash = hasher.finish();

        // Generate 384-dimensional vector from hash
        let mut embedding = Vec::with_capacity(384);
        let mut seed = hash;
        
        for _ in 0..384 {
            seed = seed.wrapping_mul(1103515245).wrapping_add(12345);
            let val = (seed % 1000) as f32 / 1000.0 - 0.5; // Normalize to [-0.5, 0.5]
            embedding.push(val);
        }

        // Normalize the vector
        let magnitude: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if magnitude > 0.0 {
            embedding.iter_mut().for_each(|x| *x /= magnitude);
        }

        embedding
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct SearchRequest {
    pub query: String,
    pub top_k: Option<usize>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct SearchResult {
    pub path: String,
    pub snippet: String,
    pub score: f32,
} 