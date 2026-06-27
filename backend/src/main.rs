use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct WifiNetwork {
    ssid: String,
    bssid: String,
    frequency: u32,
    signal_strength: i32,
    encryption: String,
    latitude: f64,
    longitude: f64,
    country: String,
    city: String,
    first_seen: String,
    last_seen: String,
}

#[derive(Serialize)]
struct MapStats {
    total_networks: u64,
    countries_covered: u32,
    cities_covered: u32,
    open_networks: u64,
}

#[derive(Deserialize)]
struct SearchQuery {
    query: String,
    lat: Option<f64>,
    lon: Option<f64>,
    radius: Option<u32>,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Global WiFi wardriving map".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn get_networks() -> impl IntoResponse {
    let networks = vec![
        WifiNetwork {
            ssid: "CoffeeShop_WiFi".to_string(),
            bssid: "AA:BB:CC:DD:EE:01".to_string(),
            frequency: 2437,
            signal_strength: -45,
            encryption: "WPA2".to_string(),
            latitude: 40.7128,
            longitude: -74.0060,
            country: "US".to_string(),
            city: "New York".to_string(),
            first_seen: "2024-01-15".to_string(),
            last_seen: "2024-03-20".to_string(),
        },
        WifiNetwork {
            ssid: "Airport_Free".to_string(),
            bssid: "AA:BB:CC:DD:EE:02".to_string(),
            frequency: 5180,
            signal_strength: -62,
            encryption: "Open".to_string(),
            latitude: 51.5074,
            longitude: -0.1278,
            country: "UK".to_string(),
            city: "London".to_string(),
            first_seen: "2024-02-10".to_string(),
            last_seen: "2024-03-18".to_string(),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(networks),
        error: None,
    })
}

async fn search_networks(Json(query): Json<SearchQuery>) -> impl IntoResponse {
    let networks = vec![
        WifiNetwork {
            ssid: format!("{}_Network", query.query),
            bssid: "AA:BB:CC:DD:EE:99".to_string(),
            frequency: 2412,
            signal_strength: -50,
            encryption: "WPA2".to_string(),
            latitude: query.lat.unwrap_or(0.0),
            longitude: query.lon.unwrap_or(0.0),
            country: "Discovered".to_string(),
            city: "Search Result".to_string(),
            first_seen: "2024-03-01".to_string(),
            last_seen: "2024-03-20".to_string(),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(networks),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(MapStats {
            total_networks: 2847563,
            countries_covered: 195,
            cities_covered: 45230,
            open_networks: 456789,
        }),
        error: None,
    })
}

async fn get_heatmap_data() -> impl IntoResponse {
    let heatmap = vec![
        serde_json::json!({ "lat": 40.7128, "lng": -74.0060, "intensity": 95 }),
        serde_json::json!({ "lat": 51.5074, "lng": -0.1278, "intensity": 88 }),
        serde_json::json!({ "lat": 35.6762, "lng": 139.6503, "intensity": 92 }),
        serde_json::json!({ "lat": 48.8566, "lng": 2.3522, "intensity": 85 }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(heatmap),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/networks", get(get_networks))
        .route("/api/search", post(search_networks))
        .route("/api/stats", get(get_stats))
        .route("/api/heatmap", get(get_heatmap_data))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Global WiFi wardriving map backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
