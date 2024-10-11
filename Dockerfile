# Use a multi-stage build for the Rust backend
FROM rust:latest AS backend-builder

# Set the working directory
WORKDIR /app/backend

# Copy the backend source code
COPY backend/ .

RUN apt-get update && apt-get install -y libssl-dev libdbus-1-dev libdbus-1-dev

# Build the backend
RUN cargo build --release

# Use a multi-stage build for the React frontend
FROM node:latest AS frontend-builder

# Set the working directory
WORKDIR /app/frontend

# Copy the frontend source code
COPY frontend/ .

# Install dependencies and build the frontend
RUN npm install && npm run build

# Final stage to run the application
FROM debian:latest

# Install necessary dependencies
RUN apt-get update && apt-get install -y libssl-dev libdbus-1-dev

# Set the working directory
WORKDIR /app

# Copy the built backend and frontend from the previous stages
COPY --from=backend-builder /app/backend/target/release/backend /app/backend
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Expose the necessary ports
EXPOSE 8080

# Mount /run/dbus/system_bus_socket to allow the backend to communicate with the system bus
VOLUME /var/run/dbus/system_bus_socket

# Command to run both backend and frontend
CMD ["sh", "-c", "/app/backend /app/frontend/build"]