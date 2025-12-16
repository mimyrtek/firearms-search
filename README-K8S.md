# Firearms Search Application - Kubernetes Deployment

## Overview
This is a Next.js application for searching firearms licence holders and their registered firearms, containerized and deployed to Kubernetes.

## Prerequisites
- Docker
- Kubernetes cluster
- kubectl configured
- kustomize (built into kubectl 1.14+)
- GitHub account (for GitHub Container Registry)

## Project Structure
```
.
├── .github/
│   └── workflows/
│       └── build-docker.yml         # CI/CD pipeline for Docker builds
├── app/                              # Next.js application
├── kustomize/
│   ├── base/                        # Base Kubernetes manifests
│   │   ├── kustomization.yaml
│   │   ├── namespace.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── secret.yaml
│   └── overlays/
│       ├── dev/                     # Development environment
│       │   ├── kustomization.yaml
│       │   └── deployment-patch.yaml
│       └── prod/                    # Production environment
│           ├── kustomization.yaml
│           ├── deployment-patch.yaml
│           └── ingress.yaml
├── Dockerfile
└── .dockerignore
```

## Setup Instructions

### 1. GitHub Container Registry Setup

1. Enable GitHub Packages in your repository
2. Update `kustomize/base/kustomization.yaml`:
   ```yaml
   images:
     - name: firearms-search
       newName: ghcr.io/YOUR_GITHUB_USERNAME/firearms-search
       newTag: latest
   ```

3. Push your code to GitHub - the workflow will automatically build and push the image

### 2. Configure Database Connection

Update the database connection string in `kustomize/base/secret.yaml`:

```yaml
stringData:
  database-url: "postgresql://username:password@your-postgres-host:5432/firearms"
```

**Security Note**: For production, use Kubernetes secrets management tools like:
- Sealed Secrets
- External Secrets Operator
- HashiCorp Vault
- Cloud provider secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)

### 3. Deploy to Kubernetes

#### Development Environment
```bash
# Preview the manifests
kubectl kustomize kustomize/overlays/dev

# Deploy
kubectl apply -k kustomize/overlays/dev

# Check deployment status
kubectl get pods -n firearms-search
kubectl get svc -n firearms-search
```

#### Production Environment
```bash
# Update ingress hostname in kustomize/overlays/prod/ingress.yaml
# Then deploy:
kubectl apply -k kustomize/overlays/prod

# Check deployment status
kubectl get pods -n firearms-search
kubectl get ingress -n firearms-search
```

### 4. Local Testing with Docker

Build and run locally:
```bash
# Build the image
docker build -t firearms-search:local .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/firearms" \
  firearms-search:local
```

## GitHub Actions Workflow

The workflow automatically:
1. Builds the Docker image on push to `main` or `develop`
2. Pushes to GitHub Container Registry (ghcr.io)
3. Tags images appropriately:
   - `latest` for main branch
   - `develop` for develop branch
   - Version tags for git tags (e.g., `v1.0.0`)

## Kubernetes Resources

### Base Resources
- **Namespace**: `firearms-search`
- **Deployment**: 2 replicas (configurable per environment)
- **Service**: ClusterIP on port 80
- **ConfigMap**: Application configuration
- **Secret**: Database credentials

### Environment Differences

| Resource | Development | Production |
|----------|-------------|------------|
| Replicas | 1 | 3 |
| Memory Request | 128Mi | 512Mi |
| Memory Limit | 256Mi | 1Gi |
| CPU Request | 50m | 250m |
| CPU Limit | 200m | 1000m |
| Ingress | No | Yes (with TLS) |

## Monitoring

Check application health:
```bash
# Port forward to access locally
kubectl port-forward -n firearms-search svc/firearms-search 8080:80

# Test health endpoint
curl http://localhost:8080/api/health
```

View logs:
```bash
# All pods
kubectl logs -n firearms-search -l app=firearms-search

# Specific pod
kubectl logs -n firearms-search <pod-name>

# Follow logs
kubectl logs -n firearms-search -l app=firearms-search -f
```

## Scaling

Scale the deployment:
```bash
kubectl scale deployment firearms-search -n firearms-search --replicas=5
```

Or update the replica count in the kustomization file and reapply.

## Troubleshooting

### Pod not starting
```bash
kubectl describe pod -n firearms-search <pod-name>
kubectl logs -n firearms-search <pod-name>
```

### Database connection issues
Check the secret and connection string:
```bash
kubectl get secret firearms-search-secrets -n firearms-search -o yaml
```

### Image pull issues
Ensure you're authenticated to ghcr.io:
```bash
# Create image pull secret if needed
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n firearms-search
```

Then add to deployment:
```yaml
spec:
  template:
    spec:
      imagePullSecrets:
      - name: ghcr-secret
```

## Security Considerations

1. **Never commit secrets**: Use proper secret management
2. **Network policies**: Implement network policies to restrict pod communication
3. **RBAC**: Apply least-privilege RBAC rules
4. **Image scanning**: Scan images for vulnerabilities
5. **TLS**: Always use TLS in production (configured in ingress)

## Updating the Application

1. Make code changes
2. Commit and push to GitHub
3. GitHub Actions builds new image
4. Update image tag in kustomization if needed
5. Apply changes:
   ```bash
   kubectl apply -k kustomize/overlays/prod
   ```

## Rollback

Rollback to previous deployment:
```bash
kubectl rollout undo deployment/firearms-search -n firearms-search

# Or to specific revision
kubectl rollout undo deployment/firearms-search -n firearms-search --to-revision=2

# View rollout history
kubectl rollout history deployment/firearms-search -n firearms-search
```

## Clean Up

Remove all resources:
```bash
# Development
kubectl delete -k kustomize/overlays/dev

# Production
kubectl delete -k kustomize/overlays/prod

# Or delete namespace (removes everything)
kubectl delete namespace firearms-search
```
