.SUFFIXES:

# --- INIT ---

.PHONY: init
init: init-node

.PHONY: init-node
init-node:
	@echo "+ yarn"
	@yarn

# --- FORMAT ---

.PHONY: format
format: format-node format-go

.PHONY: format-node
format-node:
	@echo "+ prettier"
	@yarn prettier --write '**/*.ts'

.PHONY: format-go
format-go:
	@echo "+ go fmt"
	@go fmt ./backend

# --- CHECK ---

.PHONY: check
check: check-node check-go

.PHONY: check-node
check-node:
	@echo "+ prettier check"
	@yarn prettier --check '**/*.ts'

.PHONY: check-go
check-go:
	@echo "+ go fmt check"
	@[ "$(shell gofmt -l -e backend/ | wc -l)" -eq 0 ]

# --- CLEAN ---

.PHONY: clean
clean: clean-node

.PHONY: clean-node
clean-node:
	rm -rf node_modules cdk.out
