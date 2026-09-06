# ==============================================================================
# Antigravity Developer Makefile
# Build, pack, test, verify, and deploy the agent framework
# ==============================================================================

SHELL := /usr/bin/env bash
PYTHON ?= python3
WORKSPACE_DIR := $(shell pwd)

.PHONY: help pack install install-local install-global dry-run test verify lint clean status

help: ## Show this help menu
	@echo -e "\033[1;36mAntigravity Supercoder Framework - Developer Commands\033[0m"
	@echo "============================================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

pack: ## Build self-extracting install.sh and dist/ tarball
	@./pack.sh

install: ## Run full installer (Local workspace + Global configuration)
	@./install.sh --all -y

install-local: ## Install only to the local workspace (.agents/)
	@./install.sh --local -y

install-global: ## Install only to global Antigravity config (~/.gemini/config/)
	@./install.sh --global -y

dry-run: ## Simulate installation without modifying files
	@./install.sh --dry-run --all

test: ## Run verification suite on scripts, rules, and MCP catalog
	@echo "🧪 Running framework integrity tests..."
	@$(PYTHON) -m py_compile .agents/scripts/*.py
	@$(PYTHON) -c 'import json, glob, yaml, os; \
reg = json.load(open(".agents/mcp-registry/servers.json")); \
assert len(reg.get("mcpServers", {})) == 12, "Expected 12 servers in catalog"; \
rules = glob.glob(".agents/rules/*.md"); \
assert len(rules) >= 5, "Rules missing"; \
print("✔ Verified rules, scripts, and MCP catalog cleanly.")'

check: verify lint ## Run full verification and static checks

lint: ## Run Python syntax checks and Skylos SAST scan
	@echo "🔍 Checking Python scripts..."
	@$(PYTHON) -m py_compile .agents/scripts/*.py
	@if command -v skylos >/dev/null 2>&1; then \
		echo "🛡️ Running Skylos SAST analysis..."; \
		skylos .agents/scripts/ --exclude .agents -a --format concise || true; \
	fi

verify: ## Check MCP catalog status
	@$(PYTHON) .agents/scripts/mcp.py list

mcp-list: ## List MCP catalog and active server status
	@$(PYTHON) .agents/scripts/mcp.py list

mcp-enable: ## Enable an MCP server (e.g. make mcp-enable s=neon)
	@$(PYTHON) .agents/scripts/mcp.py enable $(s)

mcp-disable: ## Disable an MCP server (e.g. make mcp-disable s=neon)
	@$(PYTHON) .agents/scripts/mcp.py disable $(s)

mcp-reset: ## Reset to zero-default clean profile (0 active servers)
	@$(PYTHON) .agents/scripts/mcp.py reset

clean: ## Clean cache, temp files, and test directories
	@rm -rf /tmp/agy-* dist/*.tar.gz .agents/cache/*.db
	@find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "✨ Clean complete."

status: ## Check status of MCP servers and codebase summary freshness
	@$(PYTHON) .agents/scripts/analyze.py . --check
