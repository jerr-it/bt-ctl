use axum::{http::StatusCode, routing::get, Json, Router};
use serde::Serialize;
use tower_http::services::ServeDir;

#[derive(Serialize)]
pub struct BtDevice {
    name: String,
    mac: String,
}

#[tokio::main]
async fn main() {
    let current_dir = std::env::current_dir().unwrap();
    let frontend_path = format!("{}/../frontend/build", current_dir.to_str().unwrap());

    println!("Frontend path: {frontend_path}");

    let app = Router::new()
        .route("/list_devs", get(list_devices))
        .nest_service("/", ServeDir::new(std::fs::canonicalize(frontend_path).unwrap()));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("Serving on 127.0.0.1:8080");
    axum::serve(listener, app).await.unwrap();
}

async fn list_devices() -> (StatusCode, Json<Vec<BtDevice>>) {
    (StatusCode::OK, Json(Vec::new()))
}
