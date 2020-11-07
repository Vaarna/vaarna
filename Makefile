.SUFFIXES:

YARN = yarn
POETRY = poetry
PYTHON = ${POETRY} run python

# --- INIT ---

.PHONY: init
init: init-backend init-frontend init-infra

.PHONY: init-backend
init-backend:
	@echo "+ poetry"
	@cd backend && ${POETRY} install --no-root

.PHONY: init-frontend
init-frontend:
	@echo "+ yarn"
	@cd frontend && ${YARN}

.PHONY: init-infra
init-infra:
	@echo "+ yarn"
	@cd infra && ${YARN}

# --- BUILD ---

.PHONY: build
build: build-frontend

.PHONY: build-frontend
build-frontend:
	@echo "+ parcel build"
	@cd frontend \
	&& ${YARN} parcel build \
		--no-cache --no-source-maps \
		frontend/index.html

# --- DEV ---

.PHONY: dev-backend
dev-backend:
	cd backend \
	&& CORS_ALLOW_ORIGINS='["http://localhost:1234"]' \
		${PYTHON} -m gm_screen start --dev

.PHONY: dev-frontend
dev-frontend:
	cd frontend \
	&& ${YARN} parcel serve \
		--no-cache --no-autoinstall \
		src/index.html

# --- FORMAT ---

.PHONY: format
format: format-backend format-frontend format-infra

.PHONY: format-backend
format-backend:
	@echo "+ isort"
	@cd backend \
	&& ${PYTHON} -m isort gm_screen

	@echo "+ black"
	@cd backend \
	&& ${PYTHON} -m black gm_screen

.PHONY: format-frontend
format-frontend:
	@echo "+ prettier"
	@cd frontend \
	&& ${YARN} prettier --write frontend

.PHONY: format-infra
format-infra:
	@echo "+ prettier"
	@cd infra \
	&& ${YARN} prettier --write infra

# --- CHECK ---

.PHONY: check
check: check-backend check-frontend check-infra

.PHONY: check-backend
check-backend:
	@echo "+ isort"
	@cd backend \
	&& ${PYTHON} -m isort --check-only gm_screen

	@echo "+ black"
	@cd backend \
	&& ${PYTHON} -m black --check gm_screen

	@echo "+ mypy"
	@cd backend \
	&& ${PYTHON} -m mypy gm_screen

.PHONY: check-frontend
check-frontend:
	@echo "+ prettier check"
	@cd frontend \
	&& ${YARN} prettier --check src/

.PHONY: check-infra
check-infra:
	@echo "+ prettier check"
	@cd infra \
	&& ${YARN} prettier --check src/

# --- CLEAN ---

.PHONY: clean
clean: clean-backend clean-frontend clean-infra

.PHONY: clean-backend
clean-backend:
	find backend/ -name __pycache__ -or -name '*.pyc' -delete
	rm -rf backend/.mypy_cache/

.PHONY: clean-frontend
clean-frontend:
	rm -rf frontend/node_modules/ frontend/.cache/ frontend/dist/

.PHONY: clean-frontend
clean-infra:
	rm -rf infra/node_modules/ infra/cdk.out/
