use std::{str::FromStr, sync::Arc, time::Duration};

use axum::{extract::State, http::StatusCode, routing::{get, post}, Json, Router};
use bluez_async::{BluetoothSession, MacAddress};
use serde::Serialize;
use tokio::sync::Mutex;
use tower_http::services::ServeDir;

#[derive(Serialize)]
pub struct BtDevice {
    name: String,
    mac: String,
    icon: Option<String>,

    blocked: bool,
    paired: bool,
    bonded: bool,
    connected: bool,
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
        .route("/connect_device", post(connect_device))
        .route("/disconnect_device", post(disconnect_device))
        .nest_service("/", ServeDir::new(std::fs::canonicalize(frontend_path).unwrap()))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
    println!("Serving on 127.0.0.1:8080");
    axum::serve(listener, app).await.unwrap();
}

async fn connect_device(
    State(state): State<Arc<Mutex<BluetoothSession>>>,
    Json(mac_address): Json<String>,
) -> (StatusCode, Json<String>) {
    let session_guard = state.lock().await;

    let devices = match session_guard.get_devices().await {
        Ok(devices) => devices,
        Err(e) => return (StatusCode::SERVICE_UNAVAILABLE, Json(format!("Cannot fetch devices: {e}")))
    };

    let target_mac = match MacAddress::from_str(&mac_address) {
        Ok(mac) => mac,
        Err(e) => return (StatusCode::BAD_REQUEST, Json(format!("Invalid MAC address: {e}")))
    };

    let target_device = devices.iter().find(|device| device.mac_address == target_mac);
    if target_device.is_none() {
        return (StatusCode::BAD_REQUEST, Json(format!("No device with MAC '{mac_address}'")))
    }

    if let Err(e) = session_guard.connect_with_timeout(&target_device.unwrap().id, Duration::from_secs(5)).await {
        return (StatusCode::SERVICE_UNAVAILABLE, Json(format!("Cannot connect to target device: {e}")));
    }

    (StatusCode::OK, Json("Device connected".to_string()))
}

async fn disconnect_device(
    State(state): State<Arc<Mutex<BluetoothSession>>>,
    Json(mac_address): Json<String>,
) -> (StatusCode, Json<String>) {
    let session_guard = state.lock().await;

    let devices = match session_guard.get_devices().await {
        Ok(devices) => devices,
        Err(e) => return (StatusCode::SERVICE_UNAVAILABLE, Json(format!("Cannot fetch devices: {e}")))
    };

    let target_mac = match MacAddress::from_str(&mac_address) {
        Ok(mac) => mac,
        Err(e) => return (StatusCode::BAD_REQUEST, Json(format!("Invalid MAC address: {e}")))
    };

    let target_device = devices.iter().find(|device| device.mac_address == target_mac);
    if target_device.is_none() {
        return (StatusCode::BAD_REQUEST, Json(format!("No device with MAC '{mac_address}'")))
    }

    if let Err(e) = session_guard.disconnect(&target_device.unwrap().id).await {
        return (StatusCode::SERVICE_UNAVAILABLE, Json(format!("Cannot disconnect target device: {e}")));
    }

    (StatusCode::OK, Json("Device disconnected".to_string()))
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
        BtDevice {
            name: dev.name.clone().unwrap_or("Unnamed device".to_string()),
            mac: dev.mac_address.to_string(),
            icon: dev.icon.clone(),

            blocked: dev.blocked,
            paired: dev.paired,
            bonded: dev.bonded,
            connected: dev.connected,
        }
    }).collect();

    (StatusCode::OK, Json(devices))
}
