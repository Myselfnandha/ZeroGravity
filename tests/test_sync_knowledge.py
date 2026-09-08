#!/usr/bin/env python3
"""
ZeroGravity OS: Knowledge & Strategy Auto-Sync Tests
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE / ".agents" / "scripts"))
import sync_knowledge

SYNC_PY = WORKSPACE / ".agents" / "scripts" / "sync_knowledge.py"
ZG_CLI = WORKSPACE / ".agents" / "scripts" / "zg"


class TestSyncKnowledgeEngine(unittest.TestCase):
    def test_sanitize_paths(self):
        raw_unix = "Failed at /home/nandha/Desktop/agent/build.sh with exit code 1"
        sanitized = sync_knowledge.sanitize_text(raw_unix)
        self.assertNotIn("/home/nandha", sanitized)
        self.assertIn("~/Desktop/agent/build.sh", sanitized)

        raw_mac = "Check config in /Users/johndoe/projects/app"
        sanitized_mac = sync_knowledge.sanitize_text(raw_mac)
        self.assertNotIn("/Users/johndoe", sanitized_mac)
        self.assertIn("~/projects/app", sanitized_mac)

        raw_win = r"Path is C:\Users\Administrator\workspace\config.json"
        sanitized_win = sync_knowledge.sanitize_text(raw_win)
        self.assertNotIn("Administrator", sanitized_win)
        self.assertIn("~", sanitized_win)

    def test_sanitize_secrets(self):
        # GitHub Token
        sample_gh = "Auth using ghp_1234567890abcdefghijklmnopqrstuvwxyz12"
        self.assertIn("[REDACTED_GITHUB_TOKEN]", sync_knowledge.sanitize_text(sample_gh))
        self.assertNotIn("ghp_1234567890", sync_knowledge.sanitize_text(sample_gh))

        # API Key
        sample_sk = "Bearer sk-proj-1234567890abcdef1234567890abcdef"
        self.assertIn("[REDACTED_API_KEY]", sync_knowledge.sanitize_text(sample_sk))

        # AWS Key
        sample_aws = "Credentials AKIAIOSFODNN7EXAMPLE"
        self.assertIn("[REDACTED_AWS_KEY]", sync_knowledge.sanitize_text(sample_aws))

        # Password
        sample_pwd = 'database_url: "postgres://user:password=\'super_secret_123\'@localhost"'
        sanitized_pwd = sync_knowledge.sanitize_text(sample_pwd)
        self.assertNotIn("super_secret_123", sanitized_pwd)

        # Private Key
        sample_pk = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----"
        self.assertIn("[REDACTED_PRIVATE_KEY]", sync_knowledge.sanitize_text(sample_pk))

    def test_classify_ecosystem(self):
        self.assertEqual(sync_knowledge.classify_ecosystem("Vite React component rendering issue"), "web")
        self.assertEqual(sync_knowledge.classify_ecosystem("FastAPI AsyncIO coroutine timeout with pytest"), "python")
        self.assertEqual(sync_knowledge.classify_ecosystem("Docker container multi-stage build cache"), "docker")
        self.assertEqual(sync_knowledge.classify_ecosystem("React Native Expo iOS pod install failure"), "mobile")
        self.assertEqual(sync_knowledge.classify_ecosystem("Git rebase and AAA test design"), "general")

    def test_record_and_list_build_flows(self):
        # Record temporary flow
        flow = sync_knowledge.record_build_flow(
            name="Test Docker Multi-Stage Build",
            stack="docker",
            commands=["docker build -t test-app .", "docker run --rm test-app"],
            notes="Automated test flow"
        )
        self.assertTrue(flow["id"].startswith("FLOW-"))
        self.assertEqual(flow["stack"], "docker")

        # Load and verify
        data = sync_knowledge.load_build_flows()
        found = any(f["id"] == flow["id"] for f in data.get("flows", []))
        self.assertTrue(found, "Newly recorded flow should exist in build_flows.json")

        # Clean up test flow from disk
        data["flows"] = [f for f in data.get("flows", []) if f["id"] != flow["id"]]
        sync_knowledge.save_build_flows(data)

    def test_package_knowledge_payload(self):
        payload = sync_knowledge.package_knowledge_payload()
        self.assertEqual(payload["central_target"], "Myselfnandha/ZeroGravity")
        self.assertIn("anti_patterns", payload)
        self.assertIn("build_flows", payload)
        self.assertIn("decisions", payload)
        self.assertGreaterEqual(len(payload["anti_patterns"]), 5)

    def test_zg_cli_sync_dry_run(self):
        res = subprocess.run([str(ZG_CLI), "sync", "--dry-run"], capture_output=True, text=True, check=True)
        self.assertEqual(res.returncode, 0)
        self.assertIn("ZeroGravity OS Knowledge & Strategy Auto-Sync", res.stdout)
        self.assertIn("DRY RUN", res.stdout)

    def test_zg_cli_flow_list(self):
        res = subprocess.run([str(ZG_CLI), "flow", "list"], capture_output=True, text=True, check=True)
        self.assertEqual(res.returncode, 0)
        self.assertIn("ZEROGRAVITY OS CAPTURED BUILD FLOWS", res.stdout)


if __name__ == "__main__":
    unittest.main()
