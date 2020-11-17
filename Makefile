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
	&& ${YARN} rollup --config

# --- DEV ---

.PHONY: dev-backend
dev-backend:
	cd backend \
	&& ${PYTHON} -m gm_screen start --dev

.PHONY: dev-frontend
dev-frontend:
	cd frontend \
	&& ${YARN} rollup --config --watch

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
	&& ${YARN} prettier --write src/

.PHONY: format-infra
format-infra:
	@echo "+ prettier"
	@cd infra \
	&& ${YARN} prettier --write src/

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

	@echo "+ pyflakes"
	@cd backend \
	&& ${PYTHON} -m pyflakes gm_screen

.PHONY: check-frontend
check-frontend:
	@echo "+ prettier check"
	@cd frontend \
	&& ${YARN} prettier --check src/

	@echo "+ tsc check"
	@cd frontend \
	&& ${YARN} tsc --noEmit

.PHONY: check-infra
check-infra:
	@echo "+ prettier check"
	@cd infra \
	&& ${YARN} prettier --check src/

	@echo "+ tsc check"
	@cd frontend \
	&& ${YARN} tsc --noEmit

# --- TEST ---

.PHONY: test
test: test-frontend

.PHONY: test-frontend
test-frontend:
	@echo "+ jest"
	@cd frontend \
	&& ${YARN} jest

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
