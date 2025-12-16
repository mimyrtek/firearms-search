# DO NOT DEPLOY THIS DIRECTORY DIRECTLY

This is the base kustomization. You should deploy one of the overlays:

## Development:
```bash
kubectl apply -k kustomize/overlays/dev
```

## Production:
```bash
kubectl apply -k kustomize/overlays/prod
```

## Preview manifests before applying:
```bash
kubectl kustomize kustomize/overlays/dev
kubectl kustomize kustomize/overlays/prod
```
