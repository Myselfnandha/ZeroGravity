#!/usr/bin/env python3
"""
ZeroGravity OS: Learning Engine & Anti-Patterns Matrix Tests
"""
import json
import subprocess
import unittest
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
LEARN_PY = WORKSPACE / ".agents" / "scripts" / "learn.py"
ANTI_PATTERNS_JSON = WORKSPACE / ".agents" / "memory" / "anti_patterns.json"
GOTCHAS_MD = WORKSPACE / ".agents" / "memory" / "gotchas.md"


class TestLearningEngine(unittest.TestCase):
    def test_matrix_integrity_and_sync(self):
        self.assertTrue(ANTI_PATTERNS_JSON.exists(), "anti_patterns.json must exist")
        self.assertTrue(GOTCHAS_MD.exists(), "gotchas.md must exist")
        
        with open(ANTI_PATTERNS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        patterns = data.get("anti_patterns", [])
        self.assertGreaterEqual(len(patterns), 5, "Should have at least 5 core anti-patterns immunized")
        
        # Verify markdown contains all IDs
        with open(GOTCHAS_MD, "r", encoding="utf-8") as f:
            md_content = f.read()
            
        for p in patterns:
            self.assertIn(p["id"], md_content, f"Markdown missing {p['id']}")
            self.assertTrue(len(p.get("mistake", "")) > 5, f"Entry {p['id']} mistake too short")
            self.assertTrue(len(p.get("strategy", "")) > 5, f"Entry {p['id']} strategy too short")

    def test_learn_cli_audit(self):
        res = subprocess.run(["python3", str(LEARN_PY), "audit"], capture_output=True, text=True, check=True)
        self.assertEqual(res.returncode, 0)
        self.assertIn("Anti-Patterns memory matrix is healthy", res.stdout)

    def test_learn_cli_check_interceptor(self):
        # Known mistake query should trigger detection (exit code 1)
        res = subprocess.run(["python3", str(LEARN_PY), "check", "--query", "ANSI"], capture_output=True, text=True)
        self.assertEqual(res.returncode, 1, "Should exit with 1 when anti-pattern match is found")
        self.assertIn("AP-001", res.stdout)
        
        # Safe query should pass (exit code 0)
        res = subprocess.run(["python3", str(LEARN_PY), "check", "--query", "completely_safe_action_xyz"], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0)
        self.assertIn("Safe", res.stdout)


if __name__ == "__main__":
    unittest.main()
