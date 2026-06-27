.PHONY: dev build test lint clean docker-up docker-down

# Development
dev-backend:
	cd backend && cargo run

dev-frontend:
	cd frontend && npm run dev

dev: dev-backend dev-frontend

# Build
build-backend:
	cd backend && cargo build --release

build-frontend:
	cd frontend && npm run build

build: build-backend build-frontend

# Test
test-backend:
	cd backend && cargo test

test-frontend:
	cd frontend && npm test

test: test-backend test-frontend

# Lint
lint-backend:
	cd backend && cargo clippy --all-targets --all-features -- -D warnings

lint-frontend:
	cd frontend && npm run lint

lint: lint-backend lint-frontend

# Format
fmt:
	cd backend && cargo fmt
	cd frontend && npx prettier --write .

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

# Clean
clean:
	cd backend && cargo clean
	cd frontend && rm -rf .next node_modules

# Setup
setup: setup-backend setup-frontend

setup-backend:
	cd backend && cargo install cargo-watch || true
	cd backend && cargo install cargo-edit || true

setup-frontend:
	cd frontend && npm install
