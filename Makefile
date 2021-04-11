.SUFFIXES:

YARN := yarn
BIN := ${shell ${YARN} bin}

DOCKER_COMPOSE := docker-compose

NEXT := ${BIN}/next
PINO_PRETTY := ${BIN}/pino-pretty

TSC := ${BIN}/tsc
ESLINT := ${BIN}/eslint
PRETTIER := ${BIN}/prettier

JEST := ${BIN}/jest
TESTCAFE := ${BIN}/testcafe

TESTCAFE_BROWSERS := firefox

.PHONY: help
help:
	@echo TODO: help message

.PHONY: init
init:
	${YARN}

.PHONY: clean
clean:
	rm -rf .next cdk.out screenshots/ node_modules/

# --- DEV ---

.PHONY: dev
dev: dev-services
	${NEXT} dev | ${PINO_PRETTY}

.PHONY: dev-services
dev-services:
	${DOCKER_COMPOSE} up -d
	scripts/create-dev.sh

# --- CHECK ---

.PHONY: check
check: check-tsc check-eslint check-prettier

.PHONY: check-tsc
check-tsc:
	${TSC}

.PHONY: check-eslint
check-eslint:
	${ESLINT} '**/*.{ts,tsx}'

.PHONY: check-prettier
check-prettier:
	${PRETTIER} --check --ignore-path .gitignore './**/*.{js,jsx,ts,tsx,json,css}'

# --- TEST ---

.PHONY: test
test: test-jest test-testcafe

.PHONY: test-jest
test-jest:
	${JEST}

.PHONY: test-testcafe
test-testcafe:
	${TESTCAFE} -a "${NEXT} dev" ${TESTCAFE_BROWSERS}

