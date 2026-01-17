.PHONY: dev stop restart build logs clean help

dev: ## Start the development servers (backend + frontend)
	docker-compose up --build -d
	@echo "=================================="
	@echo "Development servers are running!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8081"
	@echo "=================================="

stop: ## Stop all services
	docker-compose down

restart: stop dev ## Restart all services

build: ## Build/rebuild the containers
	docker-compose build

logs: ## Show logs from all services
	docker-compose logs -f

logs-fe: ## Show frontend logs only
	docker-compose logs -f frontend

logs-be: ## Show backend logs only
	docker-compose logs -f backend

clean: ## Stop services and remove volumes
	docker-compose down -v

shell-be: ## Open a shell in the backend container
	docker-compose exec backend bash

shell-fe: ## Open a shell in the frontend container
	docker-compose exec frontend sh

test-be: ## Run backend tests
	docker-compose exec backend coverage run -m pytest --log-cli-level=INFO && docker-compose exec backend coverage report

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)