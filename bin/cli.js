#!/usr/bin/env node

/**
 * ==============================================================================
 * 🌌 ZeroGravity OS - Universal Workspace Installer & Updater (CLI)
 * Zero-dependency Node.js CLI to install and update ZeroGravity in any workspace.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const readline = require('readline');

const REPO_TARBALL_URL = 'https://codeload.github.com/Myselfnandha/ZeroGravity/tar.gz/refs/heads/main';
const REPO_GIT_URL = 'https://github.com/Myselfnandha/ZeroGravity.git';

// ANSI Colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m'
};

function printBanner() {
  console.log(`
${C.cyan}${C.bold}============================================================
 🚀 ZeroGravity OS — Workspace Deployer (npx zerogravity)
============================================================${C.reset}`);
}

function printHelp() {
  printBanner();
  console.log(`
${C.bold}Usage:${C.reset}
  npx zerogravity [target-directory] [options]          # Fresh install
  npx zerogravity update [target-directory] [options]   # Update existing workspace
  zg [command] [target-directory] [options]

${C.bold}Commands:${C.reset}
  install (default)       Install ZeroGravity (.agents/) into target workspace
  update, upgrade         Update existing .agents/ to latest (preserves memory)
  init-local              Create .agents-local/memory/ for project-specific patterns
  mcp                     Manage on-demand MCP servers (list, enable, disable, status, sync)
  harness                 Recursive Agent Harnessing (status, inspect, validate, propose, ledger)

${C.bold}Arguments:${C.reset}
  target-directory        Workspace path to install/update (default: current directory)

${C.bold}Options:${C.reset}
  -t, --target <path>     Explicit target directory path
  -l, --local             Target local workspace (.agents/) only (default)
  -A, --all-workspaces    Update all registered active workspaces on the system
  -f, --force             Overwrite without prompting
  -y, --yes               Non-interactive mode (auto-accept all prompts)
  --dry-run               Simulate execution without modifying any files
  -v, --version           Show CLI version
  -h, --help              Show this help menu

${C.bold}Examples:${C.reset}
  npx zerogravity                           # Interactive install in current directory
  npx zerogravity ./my-project -y           # Install to ./my-project non-interactively
  npx zerogravity update                    # Update .agents/ in current directory
  npx zerogravity update /apps/web -y       # Update /apps/web non-interactively
  npx zerogravity init-local                # Create .agents-local/ in current directory
`);
}

// Parse command line arguments
function parseArgs(argv) {
  const args = {
    command: 'install', // 'install' | 'update'
    target: '',
    mode: 'local', // 'local' | 'global' | 'all'
    force: false,
    yes: false,
    dryRun: false
  };

  const positional = [];

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    } else if (arg === '-v' || arg === '--version') {
      const pkg = require('../package.json');
      console.log(`zerogravity v${pkg.version}`);
      process.exit(0);
    } else if (arg === '-t' || arg === '--target') {
      args.target = argv[++i];
    } else if (arg === '-l' || arg === '--local') {
      args.mode = 'local';
    } else if (arg === '-g' || arg === '--global') {
      args.mode = 'global';
    } else if (arg === '-a' || arg === '--all') {
      args.mode = 'all';
    } else if (arg === '-A' || arg === '--all-workspaces') {
      args.allWorkspaces = true;
    } else if (arg === '-f' || arg === '--force') {
      args.force = true;
    } else if (arg === '-y' || arg === '--yes') {
      args.yes = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  // Check if first positional is a subcommand
  if (positional.length > 0) {
    const first = positional[0].toLowerCase();
    if (first === 'update' || first === 'upgrade') {
      args.command = 'update';
      positional.shift();
    } else if (first === 'install') {
      args.command = 'install';
      positional.shift();
    } else if (first === 'init-local') {
      args.command = 'init-local';
      positional.shift();
    } else if (first === 'mcp') {
      args.command = 'mcp';
      positional.shift();
      if (positional.length > 0) {
        args.mcpCommand = positional[0].toLowerCase();
        positional.shift();
      } else {
        args.mcpCommand = 'list';
      }
      args.mcpArgs = [...positional];
      positional.length = 0;
    } else if (first === 'harness') {
      args.command = 'harness';
      positional.shift();
      args.harnessArgs = [...positional];
      positional.length = 0;
    }
  }

  if (!args.target && positional.length > 0) {
    args.target = positional[0];
  }
  if (!args.target) {
    args.target = process.cwd();
  }

  args.target = path.resolve(process.cwd(), args.target);
  return args;
}

// Ask user question via readline
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

// Download file with redirect handling
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    function get(currentUrl) {
      https.get(currentUrl, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download from ${currentUrl}: HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', err => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }
    get(url);
  });
}

// Copy directory recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Smart update preserving user memory and configs
function updateAgentsDir(sourceDir, targetAgentsDir, dryRun, targetDir) {
  const updatedItems = [];
  const preservedItems = [];

  if (path.resolve(sourceDir) === path.resolve(targetAgentsDir)) {
    return { updatedItems: ['(source repository up to date)'], preservedItems: [] };
  }

  const syncFolders = ['workflows', 'scripts', 'mcp-registry', 'skills', 'skills-registry', 'plugins', 'knowledge', 'hooks', 'templates'];
  const syncFiles = ['skills_index.json', 'antigravity.json', 'hooks.json', 'ARCHITECTURE.md', 'CHANGELOG.md', 'VERSION', 'AGENTS.md'];

  // Clean up retired rules directory in target workspace
  const oldRulesDir = path.join(targetAgentsDir, 'rules');
  if (fs.existsSync(oldRulesDir) && !dryRun) {
    try { fs.rmSync(oldRulesDir, { recursive: true, force: true }); } catch (_) {}
  }

  // Clean up retired legacy memory files in target workspace
  const retiredMemoryFiles = ['anti_patterns.json', 'build_flows.json', 'learned_strategies.json', 'harness_ledger.json'];
  for (const rmf of retiredMemoryFiles) {
    const destRmf = path.join(targetAgentsDir, 'memory', rmf);
    if (fs.existsSync(destRmf) && !dryRun) {
      try { fs.unlinkSync(destRmf); } catch (_) {}
    }
  }

  for (const folder of syncFolders) {
    const srcFolder = path.join(sourceDir, folder);
    const destFolder = path.join(targetAgentsDir, folder);
    if (fs.existsSync(srcFolder) && path.resolve(srcFolder) !== path.resolve(destFolder)) {
      if (!dryRun) {
        fs.rmSync(destFolder, { recursive: true, force: true });
        copyDirSync(srcFolder, destFolder);
      }
      updatedItems.push(`${folder}/`);
    }
  }

  for (const file of syncFiles) {
    const srcFile = path.join(sourceDir, file);
    const destFile = path.join(targetAgentsDir, file);
    if (fs.existsSync(srcFile) && path.resolve(srcFile) !== path.resolve(destFile)) {
      if (!dryRun) {
        fs.copyFileSync(srcFile, destFile);
      }
      updatedItems.push(file);
    }
  }

  // Preserve memory/
  const destMemory = path.join(targetAgentsDir, 'memory');
  const srcMemory = path.join(sourceDir, 'memory');
  if (fs.existsSync(srcMemory)) {
    if (!dryRun) fs.mkdirSync(destMemory, { recursive: true });
    const memoryFiles = fs.readdirSync(srcMemory);
    for (const mf of memoryFiles) {
      const destMf = path.join(destMemory, mf);
      if (!fs.existsSync(destMf)) {
        if (!dryRun) fs.copyFileSync(path.join(srcMemory, mf), destMf);
        updatedItems.push(`memory/${mf} (created default)`);
      } else {
        preservedItems.push(`memory/${mf}`);
      }
    }
  }

  // Preserve mcp_config.json
  const destMcpConfig = path.join(targetAgentsDir, 'mcp_config.json');
  if (fs.existsSync(destMcpConfig)) {
    preservedItems.push('mcp_config.json');
  } else {
    const srcMcpConfig = path.join(sourceDir, 'mcp_config.json');
    if (fs.existsSync(srcMcpConfig) && !dryRun) {
      fs.copyFileSync(srcMcpConfig, destMcpConfig);
    }
    updatedItems.push('mcp_config.json (created default)');
  }

  // Sync plugins (copy built-in plugins while preserving user-added plugins)
  const srcPlugins = path.join(sourceDir, 'plugins');
  const destPlugins = path.join(targetAgentsDir, 'plugins');
  if (fs.existsSync(srcPlugins)) {
    if (!dryRun) fs.mkdirSync(destPlugins, { recursive: true });
    const pluginList = fs.readdirSync(srcPlugins);
    for (const p of pluginList) {
      const srcPluginPath = path.join(srcPlugins, p);
      const destPluginPath = path.join(destPlugins, p);
      if (fs.statSync(srcPluginPath).isDirectory()) {
        if (!dryRun) {
          fs.rmSync(destPluginPath, { recursive: true, force: true });
          copyDirSync(srcPluginPath, destPluginPath);
        }
        updatedItems.push(`plugins/${p}/`);
      }
    }
  }
  if (fs.existsSync(destPlugins)) {
    const userPlugins = fs.readdirSync(destPlugins);
    for (const up of userPlugins) {
      if (!fs.existsSync(path.join(srcPlugins, up))) {
        preservedItems.push(`plugins/${up}/`);
      }
    }
  }

  return { updatedItems, preservedItems };
}

function getWorkspacesRegistryPath() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  return path.join(homeDir, '.gemini', 'config', 'workspaces.json');
}

function loadRegisteredWorkspaces() {
  const regPath = getWorkspacesRegistryPath();
  const workspaces = new Set();
  if (fs.existsSync(regPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      if (Array.isArray(data.workspaces)) {
        data.workspaces.forEach(w => {
          if (fs.existsSync(w) && (fs.existsSync(path.join(w, '.agents')) || fs.existsSync(path.join(w, '.agent')))) {
            workspaces.add(path.resolve(w));
          }
        });
      }
    } catch (_) {}
  }

  // Auto-discover from ~/.gemini/antigravity-ide/knowledge/
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const knowledgeDir = path.join(homeDir, '.gemini', 'antigravity-ide', 'knowledge');
  if (fs.existsSync(knowledgeDir)) {
    try {
      const items = fs.readdirSync(knowledgeDir);
      for (const item of items) {
        const metaPath = path.join(knowledgeDir, item, 'metadata.json');
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            if (Array.isArray(meta.references)) {
              for (const ref of meta.references) {
                if (typeof ref.path === 'string' && ref.path.includes('/.agents/')) {
                  const ws = ref.path.split('/.agents/')[0];
                  if (fs.existsSync(ws) && fs.existsSync(path.join(ws, '.agents'))) {
                    workspaces.add(path.resolve(ws));
                  }
                }
              }
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  return Array.from(workspaces);
}

function registerWorkspace(workspacePath) {
  try {
    const regPath = getWorkspacesRegistryPath();
    const dir = path.dirname(regPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const existing = new Set(loadRegisteredWorkspaces());
    existing.add(path.resolve(workspacePath));
    fs.writeFileSync(regPath, JSON.stringify({ workspaces: Array.from(existing).sort() }, null, 2));
  } catch (_) {}
}

function syncOtherWorkspaces(sourceDir, currentWorkspace, dryRun) {
  const allWorkspaces = loadRegisteredWorkspaces();
  const currentNorm = path.resolve(currentWorkspace);
  const updated = [];

  for (const ws of allWorkspaces) {
    if (path.resolve(ws) === currentNorm) continue;
    const wsAgents = path.join(ws, '.agents');
    if (fs.existsSync(wsAgents)) {
      try {
        updateAgentsDir(sourceDir, wsAgents, dryRun, ws);
        updated.push(ws);
      } catch (_) {}
    }
  }
  return updated;
}

function purgeGlobalPayload(dryRun) {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const globalDest = path.join(homeDir, '.gemini', 'config');
  const ideGlobalWorkflowsDir = path.join(homeDir, '.gemini', 'antigravity-ide', 'global_workflows');

  const targets = [
    path.join(globalDest, 'workflows'),
    path.join(globalDest, 'rules'),
    path.join(globalDest, 'skills'),
    path.join(globalDest, 'skills-registry'),
    path.join(globalDest, 'plugins'),
    path.join(globalDest, 'scripts'),
    path.join(globalDest, 'sidecars'),
    path.join(globalDest, 'skills_index.json'),
    path.join(globalDest, 'VERSION'),
    ideGlobalWorkflowsDir
  ];

  for (const target of targets) {
    if (fs.existsSync(target)) {
      if (dryRun) {
        console.log(`[DRY-RUN] Would remove global customization: ${target}`);
      } else {
        try {
          fs.rmSync(target, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  }
}


async function resolveSourcePayload() {
  const scriptDir = path.resolve(__dirname, '..');
  const localRepoAgents = path.join(scriptDir, '.agents');

  if (fs.existsSync(localRepoAgents) && fs.existsSync(path.join(localRepoAgents, 'workflows'))) {
    return { sourceDir: localRepoAgents, tempDirToClean: null };
  }

  console.log(`${C.blue}⬇ Fetching latest ZeroGravity OS payload from GitHub...${C.reset}`);
  const tempDir = path.join(require('os').tmpdir(), `zg-install-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const tarballPath = path.join(tempDir, 'payload.tar.gz');

  try {
    await downloadFile(REPO_TARBALL_URL, tarballPath);
    console.log(`  ${C.green}✔ Payload downloaded successfully.${C.reset}`);
    execSync(`tar -xzf "${tarballPath}" -C "${tempDir}"`, { stdio: 'pipe' });
    const extractedFolders = fs.readdirSync(tempDir).filter(f => f.startsWith('ZeroGravity-'));
    if (extractedFolders.length === 0) {
      throw new Error('Extracted payload directory not found.');
    }
    return { sourceDir: path.join(tempDir, extractedFolders[0], '.agents'), tempDirToClean: tempDir };
  } catch (err) {
    console.log(`  ${C.yellow}⚠ Tarball download failed (${err.message}). Falling back to git clone...${C.reset}`);
    const cloneDir = path.join(tempDir, 'repo');
    execSync(`git clone --depth 1 "${REPO_GIT_URL}" "${cloneDir}"`, { stdio: 'inherit' });
    return { sourceDir: path.join(cloneDir, '.agents'), tempDirToClean: tempDir };
  }
}

// -------------------------------------------------------------
// MCP COMMAND HANDLER
// -------------------------------------------------------------
async function handleMcpCommand(args, agentsDir) {
  const registryPath = path.join(agentsDir, 'mcp-registry', 'servers.json');
  const configPath = path.join(agentsDir, 'mcp_config.json');

  if (!fs.existsSync(registryPath)) {
    console.error(`${C.red}❌ Error: ZeroGravity workspace not initialized at ${agentsDir}${C.reset}`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  
  let config = { mcpServers: {} };
  if (fs.existsSync(configPath)) {
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
  }
  if (!config.mcpServers) config.mcpServers = {};

  const syncIDEs = () => {
    console.log(`\n${C.bold}🔄 Syncing IDE Configurations...${C.reset}`);
    const ideTargets = [
      { name: 'Antigravity IDE', path: path.join(process.env.HOME || process.env.USERPROFILE, '.gemini', 'antigravity-ide', 'settings', 'mcp.json') },
      { name: 'VS Code', path: path.join(process.cwd(), '.vscode', 'mcp.json') },
      { name: 'Cursor', path: path.join(process.cwd(), '.cursor', 'mcp.json') }
    ];

    ideTargets.forEach(ide => {
      const dir = path.dirname(ide.path);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(ide.path, JSON.stringify(config, null, 2));
        console.log(`  ${C.green}✔ Synced to ${ide.name}:${C.reset} ${ide.path}`);
      }
    });
  };

  const mcpCmd = args.mcpCommand;
  
  if (mcpCmd === 'list') {
    const zeroConfig = [];
    const bringKey = [];
    
    for (const [name, server] of Object.entries(registry.mcpServers)) {
      if (server.tier === 'bring-your-key') bringKey.push({name, ...server});
      else zeroConfig.push({name, ...server});
    }

    console.log(`\n${C.yellow}⚡ Zero-Config (enable instantly):${C.reset}`);
    zeroConfig.forEach(s => console.log(`  ${s.name.padEnd(16)} ${s.description}`));
    
    console.log(`\n${C.cyan}🔑 Bring-Your-Key:${C.reset}`);
    bringKey.forEach(s => console.log(`  ${s.name.padEnd(16)} ${s.description}`));
    
    const active = Object.keys(config.mcpServers);
    console.log(`\n${C.green}✅ Enabled (${active.length}):${C.reset}`);
    if (active.length === 0) console.log(`  (None)`);
    active.forEach(name => console.log(`  ${name.padEnd(16)} active`));
    console.log('');
  } 
  else if (mcpCmd === 'enable') {
    const serverNames = args.mcpArgs;
    if (serverNames.length === 0) {
      console.error(`${C.red}❌ Error: Please specify a server to enable. Run 'npx zerogravity mcp list' to see available servers.${C.reset}`);
      process.exit(1);
    }

    let modified = false;
    for (const name of serverNames) {
      const def = registry.mcpServers[name];
      if (!def) {
        console.error(`${C.red}❌ Error: Unknown server '${name}'.${C.reset}`);
        continue;
      }

      console.log(`\n${C.bold}🔧 Enabling ${name}...${C.reset}`);
      const serverConfig = {
        command: def.command,
        args: def.args || [],
        env: { ...def.env }
      };

      if (def.tier === 'bring-your-key') {
        if (def.setup_hint) console.log(`${C.cyan}Hint: ${def.setup_hint}${C.reset}`);
        for (const [envKey, envVal] of Object.entries(serverConfig.env)) {
          if (!envVal || envVal === '') {
            let answer = '';
            if (!args.yes) {
              answer = await askQuestion(`${C.yellow}Enter value for ${envKey}: ${C.reset}`);
            }
            serverConfig.env[envKey] = answer;
          }
        }
      }

      if (def.serverUrl) {
         serverConfig.serverUrl = def.serverUrl;
         delete serverConfig.command;
         delete serverConfig.args;
         delete serverConfig.env;
      }

      config.mcpServers[name] = serverConfig;
      modified = true;
      console.log(`  ${C.green}✔ ${name} enabled.${C.reset}`);
    }

    if (modified) {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      syncIDEs();
    }
  }
  else if (mcpCmd === 'disable') {
    const serverNames = args.mcpArgs;
    if (serverNames.length === 0) {
      console.error(`${C.red}❌ Error: Please specify a server to disable.${C.reset}`);
      process.exit(1);
    }

    let modified = false;
    for (const name of serverNames) {
      if (config.mcpServers[name]) {
        delete config.mcpServers[name];
        modified = true;
        console.log(`  ${C.green}✔ ${name} disabled.${C.reset}`);
      } else {
        console.log(`  ${C.yellow}⚠ ${name} was not enabled.${C.reset}`);
      }
    }

    if (modified) {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      syncIDEs();
    }
  }
  else if (mcpCmd === 'status') {
    const active = Object.keys(config.mcpServers);
    console.log(`\n${C.green}✅ Enabled Servers (${active.length}):${C.reset}`);
    if (active.length === 0) console.log(`  (None)`);
    active.forEach(name => console.log(`  ${name.padEnd(16)} active`));
    console.log('');
  }
  else if (mcpCmd === 'sync') {
    syncIDEs();
  }
  else {
    console.error(`${C.red}❌ Error: Unknown mcp subcommand '${mcpCmd}'.${C.reset}`);
    process.exit(1);
  }
}

async function handleHarnessCommand(args, agentsDir) {
  const harnessScript = path.join(agentsDir, 'scripts', 'harness.py');
  if (!fs.existsSync(harnessScript)) {
    console.error(`${C.red}❌ Error: harness.py not found in ${path.join(agentsDir, 'scripts')}.${C.reset}`);
    process.exit(1);
  }
  const subArgs = (args.harnessArgs || []).map(a => a.includes(' ') ? `"${a}"` : a).join(' ');
  const cmd = `python3 "${harnessScript}" ${subArgs}`;
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    process.exit(err.status || 1);
  }
}

function handleInitLocal(targetDir, agentsDir, dryRun) {
  const localDir = path.join(targetDir, '.agents-local', 'memory');
  const templatesDir = path.join(agentsDir, 'templates', 'local-memory');

  if (fs.existsSync(localDir)) {
    console.log(`  ${C.yellow}⚠ .agents-local/memory/ already exists in: ${targetDir}${C.reset}`);
    const existing = fs.readdirSync(localDir);
    console.log(`  ${C.cyan}Existing files:${C.reset} ${existing.join(', ')}`);
    return;
  }

  if (dryRun) {
    console.log(`[DRY-RUN] Would create .agents-local/memory/ in: ${targetDir}`);
    return;
  }

  fs.mkdirSync(localDir, { recursive: true });

  // Copy templates if available
  if (fs.existsSync(templatesDir)) {
    const templates = fs.readdirSync(templatesDir);
    for (const t of templates) {
      fs.copyFileSync(path.join(templatesDir, t), path.join(localDir, t));
    }
    console.log(`  ${C.green}✔ Created .agents-local/memory/ with templates:${C.reset} ${templates.join(', ')}`);
  } else {
    // Fallback: create minimal patterns.json
    fs.writeFileSync(path.join(localDir, 'patterns.json'), JSON.stringify({
      version: '2.0.0', updated_at: '', patterns: []
    }, null, 2));
    console.log(`  ${C.green}✔ Created .agents-local/memory/patterns.json${C.reset}`);
  }

  // Add .agents-local/ to .gitignore if not already present
  const gitignorePath = path.join(targetDir, '.gitignore');
  const gitignoreEntry = '.agents-local/';
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes(gitignoreEntry)) {
      fs.appendFileSync(gitignorePath, `\n# ZeroGravity local memory (per-workspace, not shared)\n${gitignoreEntry}\n`);
      console.log(`  ${C.green}✔ Added ${gitignoreEntry} to .gitignore${C.reset}`);
    }
  } else {
    fs.writeFileSync(gitignorePath, `# ZeroGravity local memory (per-workspace, not shared)\n${gitignoreEntry}\n`);
    console.log(`  ${C.green}✔ Created .gitignore with ${gitignoreEntry}${C.reset}`);
  }

  console.log(`\n${C.green}${C.bold}✔ Local memory initialized.${C.reset}`);
  console.log(`  The agent will read .agents-local/memory/patterns.json before file edits.`);
  console.log(`  Use ${C.cyan}/learn${C.reset} to record project-specific patterns.`);
}

function promoteUniversalPatterns(targetDir, agentsDir) {
  const localPatternsPath = path.join(targetDir, '.agents-local', 'memory', 'patterns.json');
  const sharedPatternsPath = path.join(agentsDir, 'memory', 'patterns.json');

  if (!fs.existsSync(localPatternsPath) || !fs.existsSync(sharedPatternsPath)) return [];

  let localData, sharedData;
  try {
    localData = JSON.parse(fs.readFileSync(localPatternsPath, 'utf8'));
    sharedData = JSON.parse(fs.readFileSync(sharedPatternsPath, 'utf8'));
  } catch (_) { return []; }

  if (!Array.isArray(localData.patterns) || !Array.isArray(sharedData.patterns)) return [];

  // Normalize a rule string to a set of meaningful words for comparison
  const normalize = (rule) => {
    return new Set(
      rule.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['the', 'and', 'for', 'use', 'all', 'not', 'with', 'any', 'via', 'when'].includes(w))
    );
  };

  // Jaccard similarity between two word sets
  const similarity = (setA, setB) => {
    if (setA.size === 0 && setB.size === 0) return 1;
    let intersection = 0;
    for (const w of setA) { if (setB.has(w)) intersection++; }
    return intersection / (setA.size + setB.size - intersection);
  };

  const existingNormalized = sharedData.patterns.map(p => ({
    rule: p.rule,
    words: normalize(p.rule)
  }));

  const isDuplicate = (candidateRule) => {
    const candidateWords = normalize(candidateRule);
    for (const existing of existingNormalized) {
      // Exact match
      if (existing.rule === candidateRule) return true;
      // Fuzzy match: >70% word overlap = duplicate
      if (similarity(candidateWords, existing.words) > 0.7) return true;
    }
    return false;
  };

  const promoted = [];
  const skippedDupes = [];
  const remaining = [];
  let maxId = Math.max(0, ...sharedData.patterns.map(p => parseInt(p.id.replace('P-', ''), 10) || 0));

  for (const pattern of localData.patterns) {
    if (pattern.universal === true) {
      if (isDuplicate(pattern.rule)) {
        skippedDupes.push(pattern);
        // Remove the universal flag since it's already covered
        pattern.universal = undefined;
        remaining.push(pattern);
      } else {
        maxId++;
        const promotedPattern = {
          id: `P-${String(maxId).padStart(3, '0')}`,
          type: pattern.type,
          category: pattern.category,
          rule: pattern.rule
        };
        sharedData.patterns.push(promotedPattern);
        existingNormalized.push({ rule: pattern.rule, words: normalize(pattern.rule) });
        promoted.push(promotedPattern);
      }
    } else {
      remaining.push(pattern);
    }
  }

  if (promoted.length > 0 || skippedDupes.length > 0) {
    if (promoted.length > 0) {
      sharedData.updated_at = new Date().toISOString();
      fs.writeFileSync(sharedPatternsPath, JSON.stringify(sharedData, null, 2) + '\n');
    }
    localData.patterns = remaining;
    localData.updated_at = new Date().toISOString();
    fs.writeFileSync(localPatternsPath, JSON.stringify(localData, null, 2) + '\n');
  }

  if (skippedDupes.length > 0) {
    console.log(`  ${C.yellow}⚠ Skipped ${skippedDupes.length} duplicate pattern(s) (>70% word overlap with existing):${C.reset}`);
    skippedDupes.forEach(p => console.log(`    • ${C.dim}${p.rule.substring(0, 80)}...${C.reset}`));
  }

  return promoted;
}

async function main() {
  const args = parseArgs(process.argv);
  printBanner();

  const targetDir = args.target;
  const localAgentsDest = path.join(targetDir, '.agents');
  const globalDest = path.join(process.env.HOME || process.env.USERPROFILE, '.gemini', 'config');

  console.log(`${C.blue}Command:${C.reset}      ${C.bold}${args.command.toUpperCase()}${C.reset}`);
  console.log(`${C.blue}Workspace:${C.reset}    ${C.bold}${targetDir}${C.reset}`);
  console.log(`${C.blue}Destination:${C.reset}  ${C.bold}${localAgentsDest}${C.reset}`);
  console.log('');

  // -------------------------------------------------------------
  // INIT-LOCAL COMMAND
  // -------------------------------------------------------------
  if (args.command === 'init-local') {
    handleInitLocal(targetDir, localAgentsDest, args.dryRun);
    return;
  }

  // -------------------------------------------------------------
  // HARNESS COMMAND
  // -------------------------------------------------------------
  if (args.command === 'harness') {
    await handleHarnessCommand(args, localAgentsDest);
    return;
  }

  // -------------------------------------------------------------
  // MCP COMMAND
  // -------------------------------------------------------------
  if (args.command === 'mcp') {
    await handleMcpCommand(args, localAgentsDest);
    return;
  }

  // -------------------------------------------------------------
  // UPDATE COMMAND
  // -------------------------------------------------------------
  if (args.command === 'update') {
    if (args.dryRun) {
      console.log(`${C.yellow}[DRY-RUN] Simulation mode. No files will be modified.${C.reset}`);
      console.log(`[DRY-RUN] Would update .agents/ in: ${localAgentsDest}`);
      console.log(`[DRY-RUN] Would preserve memory/ and custom configurations.`);
      const registered = loadRegisteredWorkspaces().filter(w => path.resolve(w) !== path.resolve(targetDir));
      if (registered.length > 0) {
        console.log(`[DRY-RUN] Would background sync ${registered.length} other workspace(s):`);
        registered.forEach(w => console.log(`    • ${w}`));
      }
      console.log(`\n${C.green}✔ Dry-run completed successfully.${C.reset}`);
      process.exit(0);
    }

    if (args.mode === 'local' || args.mode === 'all') {
      if (!fs.existsSync(localAgentsDest)) {
        console.error(`${C.red}❌ No existing .agents directory found in: ${targetDir}${C.reset}`);
        console.log(`Run ${C.cyan}npx zerogravity ${targetDir}${C.reset} to perform a fresh installation.`);
        process.exit(1);
      }

      if (!args.yes && !args.force) {
        const answer = await askQuestion(`${C.yellow}Ready to update .agents in ${targetDir}. Custom memory and configs will be preserved. Proceed? (Y/n): ${C.reset}`);
        if (answer && answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log(`${C.red}Update cancelled.${C.reset}`);
          process.exit(0);
        }
      }
    }

    const { sourceDir, tempDirToClean } = await resolveSourcePayload();

    try {
      if (args.mode === 'local' || args.mode === 'all') {
        console.log(`\n${C.bold}🔄 Updating .agents/ components...${C.reset}`);
        const { updatedItems, preservedItems } = updateAgentsDir(sourceDir, localAgentsDest, false, targetDir);

        // Permissions
        if (process.platform !== 'win32') {
          try {
            execSync(`chmod -R +x "${path.join(localAgentsDest, 'scripts')}" 2>/dev/null || true`);
          } catch (_) {}
        }

        console.log(`  ${C.green}✔ Updated:${C.reset} ${updatedItems.join(', ')}`);
        if (preservedItems.length > 0) {
          console.log(`  ${C.cyan}🛡️ Preserved user files:${C.reset} ${preservedItems.join(', ')}`);
        }
      }

      // Register current workspace in central registry
      registerWorkspace(targetDir);

      // Purge any legacy global customizations to ensure strictly local workspace operation
      purgeGlobalPayload(false);

      // Promote universal patterns from local memory
      const promoted = promoteUniversalPatterns(targetDir, localAgentsDest);
      if (promoted.length > 0) {
        console.log(`  ${C.green}✔ Promoted ${promoted.length} universal pattern(s) from local to shared:${C.reset}`);
        promoted.forEach(p => console.log(`    • ${C.cyan}${p.id}${C.reset}: ${p.rule}`));
      }

      // Automatically synchronize all other registered workspaces on the machine
      const otherWorkspaces = syncOtherWorkspaces(sourceDir, targetDir, false);
      if (otherWorkspaces.length > 0) {
        console.log(`  ${C.green}✔ Background synced ${otherWorkspaces.length} other registered workspace(s):${C.reset}`);
        otherWorkspaces.forEach(w => console.log(`    • ${C.cyan}${w}${C.reset}`));
      }

      console.log(`
${C.green}${C.bold}============================================================
 🎉 ZeroGravity OS Update Complete!
============================================================${C.reset}

${C.bold}Workspace Updated:${C.reset} ${C.cyan}${targetDir}${C.reset}
  • 30 Executable Slash Workflows synchronized
  • 13 On-Demand MCP Servers updated
  • Core scripts & diagnostic tools refreshed
  • User memory (decisions, gotchas, goals) safely preserved
`);
    } finally {
      if (tempDirToClean) {
        try { fs.rmSync(tempDirToClean, { recursive: true, force: true }); } catch (_) {}
      }
    }
    return;
  }

  // -------------------------------------------------------------
  // INSTALL COMMAND (DEFAULT)
  // -------------------------------------------------------------
  if (fs.existsSync(localAgentsDest) && (args.mode === 'local' || args.mode === 'all')) {
    if (!args.force && !args.yes) {
      const answer = await askQuestion(`${C.yellow}⚠ .agents directory already exists in target workspace. Overwrite? (y/N): ${C.reset}`);
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log(`${C.red}Installation cancelled. (Tip: Use 'npx zerogravity update' to update safely without full overwrite).${C.reset}`);
        process.exit(0);
      }
    }
  }

  if (args.dryRun) {
    console.log(`${C.yellow}[DRY-RUN] Simulation mode enabled. No files will be modified.${C.reset}`);
    if (args.mode === 'local' || args.mode === 'all') {
      console.log(`[DRY-RUN] Would install .agents/ into: ${localAgentsDest}`);
    }
    if (args.mode === 'global' || args.mode === 'all') {
      console.log(`[DRY-RUN] Would install global config into: ${globalDest}`);
    }
    console.log(`\n${C.green}✔ Dry-run completed successfully.${C.reset}`);
    process.exit(0);
  }

  const { sourceDir, tempDirToClean } = await resolveSourcePayload();

  try {
    if (args.mode === 'local' || args.mode === 'all') {
      console.log(`\n${C.bold}📂 Installing to Workspace (.agents/)...${C.reset}`);
      fs.mkdirSync(targetDir, { recursive: true });

      if (fs.existsSync(localAgentsDest)) {
        fs.rmSync(localAgentsDest, { recursive: true, force: true });
      }

      copyDirSync(sourceDir, localAgentsDest);
      console.log(`  ${C.green}✔ Installed .agents/ to:${C.reset} ${C.bold}${localAgentsDest}${C.reset}`);
      registerWorkspace(targetDir);

      if (process.platform !== 'win32') {
        try {
          execSync(`chmod -R +x "${path.join(localAgentsDest, 'scripts')}" 2>/dev/null || true`);
        } catch (_) {}
      }
    }

    // Purge any legacy global customizations to ensure strictly local workspace operation
    purgeGlobalPayload(args.dryRun);

    console.log(`
${C.green}${C.bold}============================================================
 🎉 ZeroGravity OS Deployment Successful!
============================================================${C.reset}

${C.bold}Active in Workspace:${C.reset} ${C.cyan}${targetDir}${C.reset}
  • Workflows   : 30 Executable Slash Commands in .agents/workflows/
  • MCP Servers : 13 On-Demand Production Servers in .agents/mcp-registry/
  • Memory Tree : Persistent Decisions, Gotchas & Goals in .agents/memory/

${C.bold}Getting Started:${C.reset}
  1. Open ${C.cyan}${targetDir}${C.reset} in Antigravity IDE.
  2. Type ${C.cyan}/build-feature${C.reset} to activate the 5-stage supercoder engine.
  3. Type ${C.cyan}/effort low|mid|high|ultra${C.reset} to tune reasoning depth.
  4. Type ${C.cyan}/mcp list${C.reset} to view on-demand MCP servers.
`);
  } finally {
    if (tempDirToClean) {
      try { fs.rmSync(tempDirToClean, { recursive: true, force: true }); } catch (_) {}
    }
  }
}

main().catch(err => {
  console.error(`\n${C.red}❌ Error:${C.reset}`, err.message);
  process.exit(1);
});
