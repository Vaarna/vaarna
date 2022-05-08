.SUFFIXES:

YARN := yarn
BIN := ${shell ${YARN} bin}

DOCKER := docker
DOCKER_COMPOSE := docker-compose

NEXT := ${BIN}/next
PINO_PRETTY := ${BIN}/pino-pretty

TSC := ${BIN}/tsc
ESLINT := ${BIN}/eslint
PRETTIER := ${BIN}/prettier

JEST := NODE_OPTIONS=--experimental-vm-modules ${BIN}/jest

.PHONY: help
help:
	@echo TODO: help message

.PHONY: init
init:
	${YARN}

.PHONY: clean
clean: clean-dev-services
	rm -rf .next/ dist/ node_modules/

.PHONY: clean-dev-services
clean-dev-services: dev-services-down
	${DOCKER} volume rm gm-screen_dynamodb gm-screen_s3

# --- DEV ---

.PHONY: dev
dev: dev-services init
	NODE_OPTIONS='--inspect' ${NEXT} dev | ${PINO_PRETTY}

.PHONY: dev-services
dev-services:
	${DOCKER_COMPOSE} up -d
	script/create-dev.sh

.PHONY: dev-services-down
dev-services-down:
	${DOCKER_COMPOSE} down

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

# --- FIX ---

.PHONY: fix
fix: fix-prettier

.PHONY: fix-prettier
fix-prettier:
	${PRETTIER} --write --ignore-path .gitignore './**/*.{js,jsx,ts,tsx,json,css}'

# --- TEST ---

.PHONY: test
test: test-jest test-testcafe

.PHONY: test-jest
test-jest:
	${JEST} ${JEST_PARAMS}

.PHONY: test-jest-watch
test-jest-watch: JEST_PARAMS += --watch
test-jest-watch: test-jest
