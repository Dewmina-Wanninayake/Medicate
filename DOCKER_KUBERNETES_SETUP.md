# Docker & Kubernetes Setup Guide

This guide covers Docker containerization and Kubernetes deployment for the Healthiest App backend.

## Table of Contents
1. [Docker Setup](#docker-setup)
2. [Docker Compose (Local Development)](#docker-compose)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Best Practices](#best-practices)

---

## Docker Setup

### Building the Docker Image

```bash
# Build the image
docker build -t healthiest-app-backend:latest .

# Tag for your registry
docker tag healthiest-app-backend:latest your-registry/healthiest-app-backend:latest

# Push to registry
docker push your-registry/healthiest-app-backend:latest
```

### Running a Single Container

```bash
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://Admin:QlayUDIfPPIfY53d@cluster0.l9mbit4.mongodb.net/" \
  -e NODE_ENV=production \
  healthiest-app-backend:latest
```

### Dockerfile Features

- **Multi-stage build**: Reduces image size by separating build and runtime stages
- **Alpine base**: Uses lightweight Alpine Linux (smaller image footprint)
- **Non-root user**: Runs as nodejs user (uid 1001) for security
- **Health checks**: Built-in health check endpoint
- **Signal handling**: Uses dumb-init for proper process management
- **Security**: Read-only root filesystem with dropped capabilities

---

## Docker Compose (Local Development)

### Starting Services

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Remove volumes too
docker-compose down -v
```

### Services Included

1. **backend**: Node.js Express application
2. **mongodb**: Local MongoDB instance

### Environment Configuration

Update MongoDB credentials in `docker-compose.yml`:
- Username: `admin`
- Password: `admin123`

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Docker image pushed to registry
- Helm (optional, useful for templating)

### Files Overview

| File | Purpose |
|------|---------|
| `namespace.yaml` | Creates healthiest-app namespace |
| `configmap.yaml` | Non-sensitive configuration |
| `secret.yaml` | Sensitive data (MongoDB URI, etc.) |
| `deployment.yaml` | Pod deployment with 3 replicas |
| `service.yaml` | ClusterIP + LoadBalancer services |
| `hpa.yaml` | Horizontal Pod Autoscaler |
| `serviceaccount.yaml` | Service account for RBAC |
| `ingress.yaml` | HTTP Ingress configuration |

### Step-by-Step Deployment

#### 1. Create Namespace

```bash
kubectl apply -f kubernetes/namespace.yaml
```

#### 2. Update Secret with Your MongoDB URI

Edit `kubernetes/secret.yaml` and update the MONGODB_URI:

```bash
# Or use command line
kubectl create secret generic backend-secret \
  --from-literal=MONGODB_URI="your-mongodb-uri" \
  -n healthiest-app
```

#### 3. Apply ConfigMap

```bash
kubectl apply -f kubernetes/configmap.yaml
```

#### 4. Apply Secret

```bash
kubectl apply -f kubernetes/secret.yaml
```

#### 5. Update Image Reference

Edit `kubernetes/deployment.yaml` and update the image:
```yaml
image: your-registry/healthiest-app-backend:v1.0.0
```

#### 6. Apply ServiceAccount

```bash
kubectl apply -f kubernetes/serviceaccount.yaml
```

#### 7. Deploy Application

```bash
kubectl apply -f kubernetes/deployment.yaml
```

#### 8. Create Services

```bash
kubectl apply -f kubernetes/service.yaml
```

#### 9. Setup Auto-scaling (Optional)

```bash
kubectl apply -f kubernetes/hpa.yaml
```

#### 10. Configure Ingress (Optional)

Update `kubernetes/ingress.yaml` with your domain, then:

```bash
kubectl apply -f kubernetes/ingress.yaml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n healthiest-app

# Check services
kubectl get svc -n healthiest-app

# Check deployment status
kubectl describe deployment backend -n healthiest-app

# View logs
kubectl logs -f deployment/backend -n healthiest-app

# Test connectivity
kubectl port-forward svc/backend 5000:5000 -n healthiest-app
# Then: curl http://localhost:5000
```

### Update Deployment

To deploy a new version:

```bash
# Update image
kubectl set image deployment/backend backend=your-registry/healthiest-app-backend:v1.1.0 -n healthiest-app

# Check rollout status
kubectl rollout status deployment/backend -n healthiest-app

# Rollback if needed
kubectl rollout undo deployment/backend -n healthiest-app
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n healthiest-app

# Auto-scaling is handled by HPA
kubectl get hpa -n healthiest-app
kubectl top pods -n healthiest-app
```

---

## Best Practices

### Security

✅ **Implemented:**
- Non-root user execution
- Read-only root filesystem
- Dropped Linux capabilities
- Health checks and probes
- Pod disruption budgets (optional)
- Network policies (optional)

✅ **Recommendations:**
- Store secrets in HashiCorp Vault or AWS Secrets Manager
- Use RBAC for service accounts
- Enable Pod Security Policies/Standards
- Scan images for vulnerabilities

### Performance

✅ **Optimized:**
- Resource requests and limits set
- Horizontal Pod Autoscaler configured
- Pod anti-affinity for distribution
- Rolling update strategy

✅ **Recommendations:**
- Monitor with Prometheus/Grafana
- Use CNI optimizations
- Consider node affinity for workload placement

### Reliability

✅ **Configured:**
- Liveness and readiness probes
- Graceful shutdown (30s termination grace period)
- 3 replica minimum
- Pod anti-affinity

✅ **Recommendations:**
- Setup Pod Disruption Budgets (PDB)
- Configure monitoring and alerts
- Backup MongoDB regularly
- Test disaster recovery procedures

### Development Workflow

```bash
# Local development with Docker Compose
docker-compose up

# Build image locally
docker build -t healthiest-app-backend:dev .

# Push to registry
docker push your-registry/healthiest-app-backend:dev

# Deploy to Kubernetes
kubectl set image deployment/backend backend=your-registry/healthiest-app-backend:dev -n healthiest-app
```

---

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n healthiest-app

# Check events
kubectl get events -n healthiest-app --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n healthiest-app
```

### MongoDB connection issues

- Verify MongoDB URI in secret
- Check network policies allow connectivity
- Ensure MongoDB is accessible from pod

### Image pull errors

```bash
# Check image registry credentials
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=username \
  --docker-password=password \
  --docker-email=email@example.com \
  -n healthiest-app
```

### Updating deployment

```bash
# Patch to add image pull secret
kubectl patch serviceaccount backend-sa \
  -p '{"imagePullSecrets": [{"name": "regcred"}]}' \
  -n healthiest-app
```

---

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Express.js with Kubernetes](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

