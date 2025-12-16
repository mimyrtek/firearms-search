# ArgoCD Deployment Guide

## Option 1: Fix Your Current Application in ArgoCD UI

Your current application has the correct path (`kustomize/overlays/dev`), but you need to verify:

1. **Go to ArgoCD UI** → Your application
2. **Check the following settings:**
   - **Path**: Should be `kustomize/overlays/dev` ✅ (you have this correct)
   - **Target Revision**: `HEAD` ✅ (you have this correct)
   - **Repo URL**: `git@github.com:mimyrtek/firearms-search.git` ✅ (you have this correct)

3. **The issue:** ArgoCD is showing an error about finding the resource at `firearms-search/` 
   - This suggests ArgoCD might be looking at the wrong directory
   - Try clicking **"Hard Refresh"** in ArgoCD UI
   - Or click **"App Details"** → **"Refresh"**

4. **If refresh doesn't work**, delete and recreate:
   ```bash
   # Delete the app
   argocd app delete firearms-search
   
   # Recreate using the manifest below
   kubectl apply -f argocd/application-dev.yaml
   ```

## Option 2: Use the Application Manifests (Recommended)

Delete your current application and use the manifests I've created:

```bash
# Delete existing application
argocd app delete firearms-search
# or via kubectl
kubectl delete application firearms-search -n argocd

# Apply the new dev application
kubectl apply -f argocd/application-dev.yaml

# Check status
argocd app get firearms-search-dev
argocd app sync firearms-search-dev
```

## Option 3: Create via ArgoCD CLI

```bash
argocd app create firearms-search-dev \
  --repo git@github.com:mimyrtek/firearms-search.git \
  --path kustomize/overlays/dev \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace firearms-search \
  --sync-policy automated \
  --sync-option CreateNamespace=true
```

## Verify Deployment

```bash
# Check ArgoCD application status
argocd app get firearms-search-dev

# Check Kubernetes resources
kubectl get all -n firearms-search

# View sync status
argocd app sync firearms-search-dev --dry-run
```

## Common Issues

### Issue: "Cannot find kustomize.config.k8s.io/Kustomization"
**Cause**: ArgoCD is looking at wrong path or there's a cache issue

**Fix**:
```bash
# Hard refresh the app
argocd app get firearms-search-dev --hard-refresh

# Or delete and recreate
argocd app delete firearms-search-dev
kubectl apply -f argocd/application-dev.yaml
```

### Issue: Image pull errors
**Fix**: Make sure your GitHub Container Registry image is public or add image pull secret:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n firearms-search
```

Then update `kustomize/base/deployment.yaml`:
```yaml
spec:
  template:
    spec:
      imagePullSecrets:
      - name: ghcr-secret
```

### Issue: Database connection errors
**Fix**: Update the secret in `kustomize/base/secret.yaml` with your actual database URL, then sync:

```bash
argocd app sync firearms-search-dev
```

## Application Structure

```
firearms-search/
├── argocd/
│   ├── application-dev.yaml     # Dev environment
│   └── application-prod.yaml    # Prod environment
└── kustomize/
    ├── base/                    # Base resources
    └── overlays/
        ├── dev/                 # Dev overlay ← ArgoCD points here
        └── prod/                # Prod overlay
```

## Auto-sync Configuration

Both manifests have auto-sync enabled:
- **Automated Sync**: Enabled (sync on git push)
- **Self Heal**: Enabled (fix manual changes)
- **Prune**: Enabled (delete removed resources)

To disable auto-sync:
```bash
argocd app set firearms-search-dev --sync-policy none
```

## Monitoring

```bash
# Watch sync status
watch argocd app get firearms-search-dev

# View logs
kubectl logs -n firearms-search -l app=firearms-search -f

# View events
kubectl get events -n firearms-search --sort-by='.lastTimestamp'
```
