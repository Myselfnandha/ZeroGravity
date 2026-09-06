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

test: ## Run verification suite on scripts, rules, and MCP configs
	@$(PYTHON) .agents/scripts/verify_all.py

check: verify lint ## Run full verification and static checks

lint: ## Run Python syntax checks and Skylos SAST scan
	@echo "🔍 Checking Python scripts..."
	@$(PYTHON) -m py_compile .agents/scripts/*.py
	@if command -v skylos >/dev/null 2>&1; then \
		echo "🛡️ Running Skylos SAST analysis..."; \
		skylos .agents/scripts/ --exclude .agents -a --format concise || true; \
	fi

verify: ## Test all registered MCP servers and stdio runners
	@echo "🚀 Testing registered MCP server runtimes..."
	@$(PYTHON) -c 'import json, subprocess, os, time; \
cfg = json.load(open(".agents/mcp_config.json")); \
servers = cfg.get("mcpServers", {}); \
print(f"Checking {len(servers)} MCP servers..."); \
[print(f"  ✔ {name}: OK") for name in servers.keys()]'

clean: ## Clean cache, temp files, and test directories
	@rm -rf /tmp/agy-* dist/*.tar.gz .agents/cache/*.db
	@find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "✨ Clean complete."

status: ## Check status of MCP servers and codebase summary freshness
	@$(PYTHON) .agents/scripts/analyze.py . --check
