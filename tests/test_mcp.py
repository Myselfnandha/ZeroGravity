#!/usr/bin/env python3
"""
ZeroGravity OS MCP Runtime & Catalog Tests (Standard Library unittest)
"""
import json
import subprocess
import unittest
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
SERVERS_JSON = WORKSPACE / ".agents" / "mcp-registry" / "servers.json"
MCP_PY = WORKSPACE / ".agents" / "scripts" / "mcp.py"
LOCAL_CONFIG = WORKSPACE / ".agents" / "mcp_config.json"


class TestZeroGravityOS(unittest.TestCase):
    def test_catalog_integrity(self):
        self.assertTrue(SERVERS_JSON.exists(), "servers.json catalog must exist")
        with open(SERVERS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        self.assertIn("mcpServers", data)
        servers = data["mcpServers"]
        self.assertEqual(len(servers), 12, "Should have 12 verified production MCP servers")
        
        for name, config in servers.items():
            self.assertIn("command", config, f"Server {name} missing command")
            self.assertIn("category", config, f"Server {name} missing category")

    def test_zero_default_clean_profile(self):
        self.assertTrue(LOCAL_CONFIG.exists(), "local mcp_config.json must exist")
        with open(LOCAL_CONFIG, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data.get("mcpServers"), {}, "Default profile must have 0 background servers")

    def test_mcp_cli_lifecycle(self):
        # 1. Reset
        res = subprocess.run(["python3", str(MCP_PY), "reset"], capture_output=True, check=True)
        self.assertEqual(res.returncode, 0)
        
        # 2. Enable context7
        res = subprocess.run(["python3", str(MCP_PY), "enable", "context7"], capture_output=True, check=True)
        self.assertEqual(res.returncode, 0)
        with open(LOCAL_CONFIG, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertIn("context7", data.get("mcpServers", {}))
        
        # 3. Disable context7
        res = subprocess.run(["python3", str(MCP_PY), "disable", "context7"], capture_output=True, check=True)
        self.assertEqual(res.returncode, 0)
        with open(LOCAL_CONFIG, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertNotIn("context7", data.get("mcpServers", {}))

    def test_mcp_run_ephemeral(self):
        # Test ephemeral run with leading '--' delimiter
        res = subprocess.run(
            ["python3", str(MCP_PY), "run", "context7", "--", "echo", "ephemeral_ok"],
            capture_output=True, text=True, check=True
        )
        self.assertEqual(res.returncode, 0)
        self.assertIn("ephemeral_ok", res.stdout)
        # Ensure server was auto-closed after command execution
        with open(LOCAL_CONFIG, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertNotIn("context7", data.get("mcpServers", {}))


if __name__ == "__main__":
    unittest.main()
