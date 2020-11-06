.SUFFIXES:

PYTHON = poetry run python

# --- INIT ---

.PHONY: init
init: init-node init-python

.PHONY: init-node
init-node:
	@echo "+ yarn"
	@yarn

.PHONY: init-python
init-python:
	@echo "+ poetry"
	@poetry install --no-root

# --- FORMAT ---

.PHONY: format
format: format-node format-python

.PHONY: format-node
format-node:
	@echo "+ prettier"
	@yarn prettier --write infra frontend

.PHONY: format-python
format-python:
	@echo "+ isort"
	@${PYTHON} -m isort gm_screen

	@echo "+ black"
	@${PYTHON} -m black gm_screen

# --- CHECK ---

.PHONY: check
check: check-node check-python

.PHONY: check-node
check-node:
	@echo "+ prettier check"
	@yarn prettier --check infra frontend

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
clean: clean-node

.PHONY: clean-node
clean-node:
	rm -rf node_modules cdk.out
