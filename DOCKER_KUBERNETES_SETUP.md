# Medicate Docker & Kubernetes Deployment Guide

This guide describes how to containerize and deploy the Medicate Telemedicine components (`appointment-video-service` and `web-client`).

## 1. Docker Basics

### Prerequisites
- Docker & Docker Compose installed

### Local Development (Docker Compose)
To start the entire environment (Backend, Frontend, MongoDB, Redis):

```bash
docker-compose up --build
```

Access:
- **Web Client**: http://localhost:3000
- **Appointment Service**: http://localhost:5003

### Manual Image Builds
```bash
# Appointment Service
docker build -t medicate-appointment-service ./services/appointment-video-service

# Web Client
docker build -t medicate-web-client ./web-client
```

---

## 2. Kubernetes Deployment

### Setup Sequence

#### 1. Create Namespace
```bash
kubectl apply -f k8s/common/namespace.yaml
```

#### 2. Apply Configuration (ConfigMap & Secrets)
```bash
kubectl apply -f k8s/common/configmap.yaml
kubectl apply -f k8s/common/secret.yaml
```

#### 3. Deploy Appointment Service
```bash
kubectl apply -f k8s/appointment-service/deployment.yaml
```

#### 4. Deploy Web Client
```bash
kubectl apply -f k8s/web-client/deployment.yaml
```

---

## 3. Directory Structure
- `services/appointment-video-service/Dockerfile`: Backend image definition.
- `web-client/Dockerfile`: Frontend image definition (multi-stage Nginx).
- `docker-compose.yml`: Local multi-container orchestration.
- `k8s/common/`: Shared Kubernetes resources (Namespace, Security, Config).
- `k8s/appointment-service/`: Deployment and Service for backend.
- `k8s/web-client/`: Deployment and Service (LoadBalancer) for frontend.
