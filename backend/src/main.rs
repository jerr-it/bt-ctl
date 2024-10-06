use std::sync::Arc;

use axum::{extract::State, http::StatusCode, routing::{get, post}, Json, Router};
use bluez_async::BluetoothSession;
use serde::Serialize;
use tokio::sync::Mutex;
use tower_http::services::ServeDir;

#[derive(Serialize)]
pub struct BtDevice {
    name: String,
    mac: String,
    conn_status: ConnectionStatus
}

#[derive(Serialize)]
pub enum ConnectionStatus {
    Available,
    Paired,
    Blocked,
}

#[tokio::main]
async fn main() {
    let current_dir = std::env::current_dir().unwrap();
    let frontend_path = format!("{}/../frontend/build", current_dir.to_str().unwrap());

    let (_, session) = BluetoothSession::new().await.expect("Cannot access bluetooth!");
    let app_state = Arc::new(Mutex::new(session));

    let app = Router::new()
        .route("/list_devs", get(list_devices))
        .route("/start_discovery", post(start_discovery))
        .route("/stop_discovery", post(stop_discovery))
        .nest_service("/", ServeDir::new(std::fs::canonicalize(frontend_path).unwrap()))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("Serving on 127.0.0.1:8080");
    axum::serve(listener, app).await.unwrap();
}

async fn start_discovery(
    State(state): State<Arc<Mutex<BluetoothSession>>>,
) -> (StatusCode, Json<String>) {
    let session_guard = state.lock().await;

    if let Err(e) = session_guard.start_discovery().await {
        return (StatusCode::SERVICE_UNAVAILABLE, Json(e.to_string()))
    }

    (StatusCode::OK, Json("Started discovery".to_string()))
}

async fn stop_discovery(
    State(state): State<Arc<Mutex<BluetoothSession>>>,
) -> (StatusCode, Json<String>) {
    let session_guard = state.lock().await;

    if let Err(e) = session_guard.start_discovery().await {
        return (StatusCode::SERVICE_UNAVAILABLE, Json(e.to_string()))
    }

    (StatusCode::OK, Json("Started discovery".to_string()))
}

async fn list_devices(
    State(state): State<Arc<Mutex<BluetoothSession>>>,
) -> (StatusCode, Json<Vec<BtDevice>>) {
    let session_guard = state.lock().await;

    let devices = match session_guard.get_devices().await {
        Ok(devices) => devices,
        Err(e) => {
            println!("{e:?}");
            return (StatusCode::SERVICE_UNAVAILABLE, Json(Vec::new()));
        }
    };

    let devices = devices.iter().map(|dev| {
        let mut status = ConnectionStatus::Available;

        if dev.blocked {
            status = ConnectionStatus::Blocked;
        } else if dev.paired {
            status = ConnectionStatus::Paired;
        }

        BtDevice {
            name: dev.name.clone().unwrap_or("Unnamed device".to_string()),
            mac: dev.mac_address.to_string(),
            conn_status: status,
        }
    }).collect();

    (StatusCode::OK, Json(devices))
}
