#!/usr/bin/env python3
"""
ZeroGravity OS: Unified Auto-Discovery Test Runner (`test_all.py`)
==================================================================

Replaces per-script hand-written test files with a single auto-discovery engine that:
1. Discovers all `.agents/scripts/*.py` modules
2. Verifies importability (no import errors, no missing deps)
3. Validates CLI `--help` / `-h` exits 0 (for argparse-based scripts)
4. Validates JSON data files against expected schemas
5. Smoke-runs key exported functions with safe arguments in temp dirs

Zero hand-written per-function tests. Zero token waste. Any new script
added to `.agents/scripts/` is auto-covered.
"""

import importlib
import importlib.util
import inspect
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

# ─── Constants ────────────────────────────────────────────────────────────────

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = WORKSPACE_ROOT / ".agents" / "scripts"
MEMORY_DIR = WORKSPACE_ROOT / ".agents" / "memory"

# Scripts that should NOT be tested (no main(), helper-only, or non-standalone)
SKIP_IMPORT = set()

# Scripts known to have argparse CLI (--help should exit 0)
CLI_SCRIPTS = {
    "learn.py",
    "auto_evolve.py",
    "sync_knowledge.py",
    "impact_check.py",
    "mcp.py",
    "checklist.py",
    "analyze.py",
}

# JSON data files and their required top-level keys
JSON_SCHEMAS: Dict[str, Dict[str, type]] = {
    "anti_patterns.json": {
        "version": str,
        "anti_patterns": list,
    },
    "build_flows.json": {
        "version": str,
        "flows": list,
    },
    "learned_strategies.json": {
        "version": str,
        "strategies": list,
    },
}

# Functions to smoke-run per module (module_name -> [(func_name, safe_args, safe_kwargs, expected_type)])
# These run in isolated temp dirs to avoid side effects.
SMOKE_FUNCTIONS: Dict[str, List[tuple]] = {
    "auto_evolve": [
        ("load_strategies", [], {}, dict),
        ("list_strategies", [], {}, list),
        ("get_stats", [], {}, dict),
        ("content_hash", ["title", "content"], {}, str),
        ("classify_ecosystem", ["react vite npm"], {}, str),
    ],
    "learn": [
        ("load_anti_patterns", [], {}, dict),
    ],
    "sync_knowledge": [
        ("sanitize_text", ["Test /home/user/path text"], {}, str),
        ("classify_ecosystem", ["react npm vite"], {}, str),
        ("load_build_flows", [], {}, dict),
    ],
    "impact_check": [
        ("is_binary_file", [Path("/dev/null")], {}, bool),
    ],
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def discover_scripts() -> List[Path]:
    """Find all .py files in .agents/scripts/."""
    if not SCRIPTS_DIR.exists():
        return []
    return sorted(
        p for p in SCRIPTS_DIR.glob("*.py")
        if p.name not in SKIP_IMPORT and not p.name.startswith("_")
    )


def load_module_from_path(path: Path):
    """Dynamically import a Python module from file path."""
    module_name = path.stem
    spec = importlib.util.spec_from_file_location(module_name, str(path))
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot create spec for {path}")
    module = importlib.util.module_from_spec(spec)
    # Prevent argparse from parsing test runner's args
    old_argv = sys.argv
    sys.argv = [str(path)]
    try:
        spec.loader.exec_module(module)
    finally:
        sys.argv = old_argv
    return module


def create_isolated_memory_dir() -> Path:
    """Create a temp dir with minimal .agents/memory structure."""
    tmp = Path(tempfile.mkdtemp())
    mem_dir = tmp / ".agents" / "memory"
    mem_dir.mkdir(parents=True)
    # Seed minimal JSON files
    for name, schema in JSON_SCHEMAS.items():
        data = {}
        for key, typ in schema.items():
            if typ == str:
                data[key] = "1.0.0"
            elif typ == list:
                data[key] = []
        (mem_dir / name).write_text(json.dumps(data), encoding="utf-8")
    return tmp


# ─── Test Classes ─────────────────────────────────────────────────────────────

class TestScriptImportability(unittest.TestCase):
    """
    Auto-discover every .agents/scripts/*.py and verify it imports cleanly.
    This catches missing dependencies, syntax errors, and broken imports.
    """

    @classmethod
    def setUpClass(cls):
        cls.scripts = discover_scripts()

    def test_all_scripts_importable(self):
        """Every script in .agents/scripts/ should import without errors."""
        failures = []
        for script in self.scripts:
            try:
                load_module_from_path(script)
            except Exception as e:
                failures.append(f"{script.name}: {type(e).__name__}: {e}")

        if failures:
            self.fail(
                f"{len(failures)} script(s) failed to import:\n"
                + "\n".join(f"  • {f}" for f in failures)
            )

    def test_scripts_discovered(self):
        """At least 5 scripts should be discovered."""
        self.assertGreaterEqual(
            len(self.scripts), 5,
            f"Expected ≥5 scripts, found {len(self.scripts)}"
        )


class TestCLIHelpExits(unittest.TestCase):
    """
    For scripts with argparse CLI, `python3 script.py --help` should exit 0.
    This validates the CLI contract without running any real operations.
    """

    def test_cli_help_exits_zero(self):
        """All CLI scripts should respond to --help with exit code 0."""
        failures = []
        for script_name in sorted(CLI_SCRIPTS):
            script_path = SCRIPTS_DIR / script_name
            if not script_path.exists():
                continue

            result = subprocess.run(
                [sys.executable, str(script_path), "--help"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode != 0:
                failures.append(
                    f"{script_name}: exit {result.returncode}\n"
                    f"  stderr: {result.stderr[:200]}"
                )

        if failures:
            self.fail(
                f"{len(failures)} CLI script(s) failed --help:\n"
                + "\n".join(f"  • {f}" for f in failures)
            )


class TestJSONDataSchemas(unittest.TestCase):
    """
    Validate that all JSON data files in .agents/memory/ are valid JSON
    and contain expected top-level keys with correct types.
    """

    def test_json_files_valid_and_schema_correct(self):
        """All JSON data files should parse and match expected schemas."""
        failures = []
        for filename, expected_keys in JSON_SCHEMAS.items():
            filepath = MEMORY_DIR / filename
            if not filepath.exists():
                failures.append(f"{filename}: FILE NOT FOUND")
                continue

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except json.JSONDecodeError as e:
                failures.append(f"{filename}: INVALID JSON: {e}")
                continue

            for key, expected_type in expected_keys.items():
                if key not in data:
                    failures.append(f"{filename}: missing key '{key}'")
                elif not isinstance(data[key], expected_type):
                    failures.append(
                        f"{filename}: key '{key}' is {type(data[key]).__name__}, "
                        f"expected {expected_type.__name__}"
                    )

        if failures:
            self.fail(
                f"{len(failures)} JSON schema issue(s):\n"
                + "\n".join(f"  • {f}" for f in failures)
            )


class TestSmokeFunctions(unittest.TestCase):
    """
    Smoke-run key exported functions with safe arguments in isolated temp dirs.
    Verifies functions execute without crashing and return expected types.
    """

    def setUp(self):
        self.temp_dir = create_isolated_memory_dir()

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_smoke_run_functions(self):
        """Key functions should execute cleanly and return expected types."""
        failures = []

        for module_name, funcs in SMOKE_FUNCTIONS.items():
            script_path = SCRIPTS_DIR / f"{module_name}.py"
            if not script_path.exists():
                continue

            try:
                module = load_module_from_path(script_path)
            except Exception as e:
                failures.append(f"{module_name}: import failed: {e}")
                continue

            # Patch workspace paths to temp dir for isolation
            for attr in ["WORKSPACE_ROOT", "MEMORY_DIR", "STRATEGIES_JSON",
                         "ANTI_PATTERNS_JSON", "BUILD_FLOWS_JSON",
                         "ECOSYSTEMS_DIR", "GOTCHAS_MD"]:
                if hasattr(module, attr):
                    original_val = getattr(module, attr)
                    if isinstance(original_val, Path):
                        # Remap to temp dir
                        relative = str(original_val).replace(str(WORKSPACE_ROOT), "")
                        new_path = self.temp_dir / relative.lstrip("/")
                        new_path.parent.mkdir(parents=True, exist_ok=True)
                        setattr(module, attr, new_path)

            for func_name, args, kwargs, expected_type in funcs:
                func = getattr(module, func_name, None)
                if func is None:
                    failures.append(f"{module_name}.{func_name}: function not found")
                    continue

                try:
                    result = func(*args, **kwargs)
                except Exception as e:
                    failures.append(
                        f"{module_name}.{func_name}(): {type(e).__name__}: {e}"
                    )
                    continue

                if expected_type is not None and not isinstance(result, expected_type):
                    failures.append(
                        f"{module_name}.{func_name}(): returned {type(result).__name__}, "
                        f"expected {expected_type.__name__}"
                    )

        if failures:
            self.fail(
                f"{len(failures)} smoke test failure(s):\n"
                + "\n".join(f"  • {f}" for f in failures)
            )


class TestFunctionSignatures(unittest.TestCase):
    """
    Verify that key functions exist and have expected parameter signatures.
    This catches accidental signature changes that would break callers.
    """

    # module_name -> {func_name: [expected_param_names]}
    EXPECTED_SIGNATURES: Dict[str, Dict[str, List[str]]] = {
        "auto_evolve": {
            "capture_strategy": ["knowledge_type", "title", "content"],
            "list_strategies": [],  # has optional filter_type
            "get_stats": [],
            "mark_synced": [],
            "export_unsynced": [],
            "sync_to_github": [],  # has optional dry_run
        },
        "learn": {
            "load_anti_patterns": [],
            "save_anti_patterns": ["data"],
        },
        "sync_knowledge": {
            "sanitize_text": ["text"],
            "classify_ecosystem": ["text"],
            "package_knowledge_payload": [],
        },
    }

    def test_function_signatures_stable(self):
        """Key functions should exist and accept expected required parameters."""
        failures = []

        for module_name, func_specs in self.EXPECTED_SIGNATURES.items():
            script_path = SCRIPTS_DIR / f"{module_name}.py"
            if not script_path.exists():
                continue

            try:
                module = load_module_from_path(script_path)
            except Exception as e:
                failures.append(f"{module_name}: import failed: {e}")
                continue

            for func_name, expected_params in func_specs.items():
                func = getattr(module, func_name, None)
                if func is None:
                    failures.append(f"{module_name}.{func_name}: NOT FOUND")
                    continue

                sig = inspect.signature(func)
                actual_params = [
                    p.name for p in sig.parameters.values()
                    if p.default is inspect.Parameter.empty
                    and p.name != "self"
                ]

                for param in expected_params:
                    if param not in [p.name for p in sig.parameters.values()]:
                        failures.append(
                            f"{module_name}.{func_name}: missing param '{param}' "
                            f"(has: {list(sig.parameters.keys())})"
                        )

        if failures:
            self.fail(
                f"{len(failures)} signature issue(s):\n"
                + "\n".join(f"  • {f}" for f in failures)
            )


class TestScriptHasMain(unittest.TestCase):
    """
    CLI scripts should define a main() or have if __name__ == '__main__'.
    """

    def test_cli_scripts_have_entry_point(self):
        """CLI scripts should have a callable entry point."""
        failures = []
        for script_name in sorted(CLI_SCRIPTS):
            script_path = SCRIPTS_DIR / script_name
            if not script_path.exists():
                continue

            source = script_path.read_text(encoding="utf-8")
            has_main_func = "def main(" in source
            has_name_main = '__name__' in source and '__main__' in source

            if not has_main_func and not has_name_main:
                failures.append(f"{script_name}: no main() or __name__ == '__main__'")

        if failures:
            self.fail(
                f"{len(failures)} script(s) missing entry point:\n"
                + "\n".join(f"  • {f}" for f in failures)
            )


if __name__ == "__main__":
    unittest.main()
