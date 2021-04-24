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

TESTCAFE_APP_INIT_DELAY := 1000
TESTCAFE_BROWSERS := firefox
DOMAIN = http://localhost:3000
export DOMAIN

.PHONY: help
help:
	@echo TODO: help message

.PHONY: init
init:
	${YARN}

.PHONY: clean
clean:
	rm -rf \
		.next \
		cdk.out \
		dist/ \
		node_modules/ \
		screenshots/

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

# --- TEST ---

.PHONY: test
test: test-jest test-testcafe

.PHONY: test-jest
test-jest:
	${JEST} ${JEST_PARAMS}

.PHONY: test-jest-watch
test-jest-watch: JEST_PARAMS += --watch
test-jest-watch: test-jest

.PHONY: test-testcafe
test-testcafe:
	${TESTCAFE} \
		-a "${NEXT} dev" \
		--app-init-delay ${TESTCAFE_APP_INIT_DELAY} \
		${TESTCAFE_PARAMS} \
		${TESTCAFE_BROWSERS}

.PHONY: test-testcafe-watch
test-testcafe-watch: TESTCAFE_PARAMS += --live
test-testcafe-watch: test-testcafe

.PHONY: test-testcafe-staging
test-testcafe-staging: DOMAIN = http://staging.gm-screen.net
test-testcafe-staging:
	@echo wake up the heroku dyno before running tests
	curl http://staging.gm-screen.net > /dev/null
	${TESTCAFE} \
		--app-init-delay 0 \
		${TESTCAFE_PARAMS} \
		${TESTCAFE_BROWSERS}

.PHONY: test-testcafe-production
test-testcafe-production: DOMAIN = http://gm-screen.net
test-testcafe-production:
	${TESTCAFE} \
		--app-init-delay 0 \
		${TESTCAFE_PARAMS} \
		${TESTCAFE_BROWSERS}
