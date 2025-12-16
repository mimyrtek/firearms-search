.PHONY: help build push deploy-dev deploy-prod delete-dev delete-prod logs port-forward

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker image locally
	docker build -t firearms-search:local .

push: ## Build and push to GitHub Container Registry (requires GITHUB_TOKEN)
	docker build -t ghcr.io/$(GITHUB_USER)/firearms-search:latest .
	docker push ghcr.io/$(GITHUB_USER)/firearms-search:latest

preview-dev: ## Preview development Kubernetes manifests
	kubectl kustomize kustomize/overlays/dev

preview-prod: ## Preview production Kubernetes manifests
	kubectl kustomize kustomize/overlays/prod

deploy-dev: ## Deploy to development environment
	kubectl apply -k kustomize/overlays/dev
	@echo "Waiting for deployment to be ready..."
	kubectl wait --for=condition=available --timeout=300s deployment/firearms-search-dev -n firearms-search

deploy-prod: ## Deploy to production environment
	kubectl apply -k kustomize/overlays/prod
	@echo "Waiting for deployment to be ready..."
	kubectl wait --for=condition=available --timeout=300s deployment/firearms-search-prod -n firearms-search

delete-dev: ## Delete development environment
	kubectl delete -k kustomize/overlays/dev

delete-prod: ## Delete production environment
	kubectl delete -k kustomize/overlays/prod

logs: ## Tail logs from all pods
	kubectl logs -n firearms-search -l app=firearms-search -f

logs-dev: ## Tail logs from dev pods
	kubectl logs -n firearms-search -l app=firearms-search-dev -f

logs-prod: ## Tail logs from prod pods
	kubectl logs -n firearms-search -l app=firearms-search-prod -f

port-forward: ## Port forward service to localhost:8080
	kubectl port-forward -n firearms-search svc/firearms-search 8080:80

status: ## Check deployment status
	kubectl get all -n firearms-search

describe: ## Describe all resources
	kubectl describe all -n firearms-search

scale-dev: ## Scale dev deployment (usage: make scale-dev REPLICAS=3)
	kubectl scale deployment firearms-search-dev -n firearms-search --replicas=$(REPLICAS)

scale-prod: ## Scale prod deployment (usage: make scale-prod REPLICAS=5)
	kubectl scale deployment firearms-search-prod -n firearms-search --replicas=$(REPLICAS)

restart-dev: ## Restart dev deployment
	kubectl rollout restart deployment/firearms-search-dev -n firearms-search

restart-prod: ## Restart prod deployment
	kubectl rollout restart deployment/firearms-search-prod -n firearms-search

rollback-dev: ## Rollback dev deployment to previous version
	kubectl rollout undo deployment/firearms-search-dev -n firearms-search

rollback-prod: ## Rollback prod deployment to previous version
	kubectl rollout undo deployment/firearms-search-prod -n firearms-search

history-dev: ## Show dev deployment rollout history
	kubectl rollout history deployment/firearms-search-dev -n firearms-search

history-prod: ## Show prod deployment rollout history
	kubectl rollout history deployment/firearms-search-prod -n firearms-search
