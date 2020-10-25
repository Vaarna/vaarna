.SUFFIXES:

# --- INIT ---

.PHONY: init
init: init-node

.PHONY: init-node
init-node:
	yarn

# --- FORMAT ---

.PHONY: format
format: format-node format-go

.PHONY: format-node
format-node:
	yarn prettier --write '**/*.ts'

.PHONY: format-go
format-go:
	go fmt ./backend

# --- CLEAN ---

.PHONY: clean
clean: clean-node

.PHONY: clean-node
clean-node:
	rm -rf node_modules cdk.out
