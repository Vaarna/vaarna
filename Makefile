.SUFFIXES:

YARN = yarn
PYTHON = poetry run python

# --- INIT ---

.PHONY: init
init: init-js init-python

.PHONY: init-js
init-js:
	@echo "+ yarn"
	@${YARN}

.PHONY: init-python
init-python:
	@echo "+ poetry"
	@poetry install --no-root

# --- BUILD ---

.PHONY: build
build: build-js

.PHONY: build-js
build-js:
	@echo "+ parcel build"
	@${YARN} parcel build --no-cache --no-source-maps frontend/index.html

# --- DEV ---

.PHONY: dev-js
dev-js:
	${YARN} parcel serve --no-cache --no-autoinstall frontend/index.html

.PHONY: dev-python
dev-python:
	CORS_ALLOW_ORIGINS='["http://localhost:1234"]' \
	${PYTHON} -m gm_screen start --dev

# --- FORMAT ---

.PHONY: format
format: format-js format-python

.PHONY: format-js
format-js:
	@echo "+ prettier"
	@${YARN} prettier --write infra frontend

.PHONY: format-python
format-python:
	@echo "+ isort"
	@${PYTHON} -m isort gm_screen

	@echo "+ black"
	@${PYTHON} -m black gm_screen

# --- CHECK ---

.PHONY: check
check: check-js check-python

.PHONY: check-js
check-js:
	@echo "+ prettier check"
	@${YARN} prettier --check infra/ frontend/

.PHONY: check-python
check-python:
	@echo "+ isort"
	@${PYTHON} -m isort --check-only gm_screen

	@echo "+ black"
	@${PYTHON} -m black --check gm_screen

	@echo "+ mypy"
	@${PYTHON} -m mypy gm_screen

# --- CLEAN ---

.PHONY: clean
clean: clean-js clean-python clean-cache

.PHONY: clean-js
clean-js:
	rm -rf node_modules/ cdk.out/ dist/

.PHONY: clean-python
clean-python:
	find . -name __pycache__ -or -name '*.pyc' -delete

.PHONY: clean-cache
clean-cache:
	rm -rf .cache/ .mypy_cache/
