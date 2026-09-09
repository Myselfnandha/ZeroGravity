#!/usr/bin/env python3
"""
ZeroGravity OS: Impact Analysis & Blast Radius Detection Tests
"""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE / ".agents" / "scripts"))

from impact_check import (
    DEFAULT_EXCLUDES,
    analyze_file_impact,
    extract_symbols_from_file,
    find_symbol_references,
    should_skip_path,
)

IMPACT_PY = WORKSPACE / ".agents" / "scripts" / "impact_check.py"


class TestImpactAnalysis(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.workspace = Path(self.temp_dir)

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_extract_symbols_python(self):
        py_file = self.workspace / "service.py"
        py_file.write_text(
            "API_TIMEOUT = 30\n"
            "MAX_RETRIES = 3\n"
            "\n"
            "class EngineManager:\n"
            "    pass\n"
            "\n"
            "def initialize_service(config):\n"
            "    return True\n"
            "\n"
            "async def fetch_async_data():\n"
            "    return []\n"
            "\n"
            "def _internal_helper():\n"
            "    pass\n"
        )

        symbols = extract_symbols_from_file(py_file)
        self.assertIn("API_TIMEOUT", symbols)
        self.assertIn("MAX_RETRIES", symbols)
        self.assertIn("EngineManager", symbols)
        self.assertIn("initialize_service", symbols)
        self.assertIn("fetch_async_data", symbols)
        # Private helpers with leading underscore are excluded from public interface
        self.assertNotIn("_internal_helper", symbols)

    def test_extract_symbols_javascript(self):
        js_file = self.workspace / "utils.js"
        js_file.write_text(
            "export const DEFAULT_CONFIG = { active: true };\n"
            "export function calculateMetrics() { return 42; }\n"
            "export async function processQueue() {}\n"
            "export class TokenBucket {}\n"
            "exports.legacyHandler = function() {};\n"
        )

        symbols = extract_symbols_from_file(js_file)
        self.assertIn("DEFAULT_CONFIG", symbols)
        self.assertIn("calculateMetrics", symbols)
        self.assertIn("processQueue", symbols)
        self.assertIn("TokenBucket", symbols)
        self.assertIn("legacyHandler", symbols)

    def test_find_symbol_references_and_word_boundaries(self):
        f1 = self.workspace / "app.py"
        f1.write_text(
            "import service\n"
            "result = initialize_service(cfg)\n"
            "initialize_service_v2(cfg) # Should not match\n"
        )
        f2 = self.workspace / "other.py"
        f2.write_text(
            "# No match here\n"
            "val = 10\n"
        )

        matches = find_symbol_references(self.workspace, "initialize_service")
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["file"], "app.py")
        self.assertEqual(matches[0]["line"], 2)

    def test_exclusions_handling(self):
        node_mod = self.workspace / "node_modules" / "pkg"
        node_mod.mkdir(parents=True)
        (node_mod / "index.js").write_text("initialize_service();")

        # In default excludes, node_modules must be skipped
        self.assertTrue(should_skip_path(node_mod / "index.js", self.workspace, set()))
        matches = find_symbol_references(self.workspace, "initialize_service")
        self.assertEqual(len(matches), 0)

    def test_analyze_file_impact_end_to_end(self):
        mod_file = self.workspace / "auth.py"
        mod_file.write_text(
            "def authenticate_user(token):\n"
            "    return True\n"
        )

        consumer = self.workspace / "routes.py"
        consumer.write_text(
            "from auth import authenticate_user\n"
            "user = authenticate_user('abc')\n"
        )

        impact = analyze_file_impact(self.workspace, mod_file)
        self.assertEqual(impact["target_file"], "auth.py")
        self.assertIn("authenticate_user", impact["exported_symbols"])
        self.assertEqual(impact["affected_files_count"], 1)
        self.assertIn("routes.py", impact["affected_files"])

    def test_cli_invocation_json(self):
        test_file = self.workspace / "calc.py"
        test_file.write_text("def add(a, b): return a + b\n")

        other_file = self.workspace / "main.py"
        other_file.write_text("from calc import add\nprint(add(1, 2))\n")

        res = subprocess.run(
            [sys.executable, str(IMPACT_PY), "add", "--workspace", str(self.workspace), "--json"],
            capture_output=True,
            text=True,
            check=True
        )
        data = json.loads(res.stdout)
        self.assertEqual(data["symbol"], "add")
        self.assertGreaterEqual(data["total_references"], 2)


if __name__ == "__main__":
    unittest.main()
