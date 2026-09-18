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
  mcp                     Manage on-demand MCP servers (list, enable, disable, status, sync)

${C.bold}Arguments:${C.reset}
  target-directory        Workspace path to install/update (default: current directory)

${C.bold}Options:${C.reset}
  -t, --target <path>     Explicit target directory path
  -l, --local             Target local workspace (.agents/) only (default)
  -g, --global            Target global Antigravity configuration (~/.gemini/config/)
  -a, --all               Target both local (.agents/) and global configuration
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
  npx zerogravity --global -y               # Install global configuration only
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
function updateAgentsDir(sourceDir, targetAgentsDir, dryRun) {
  const updatedItems = [];
  const preservedItems = [];

  const syncFolders = ['workflows', 'rules', 'scripts', 'mcp-registry', 'tools', 'docs', 'schemas', 'agent', 'agents', 'skills'];
  const syncFiles = ['skills_index.json', 'antigravity.json', 'manifest.json', 'manifest.lock.json', 'hooks.json', 'ARCHITECTURE.md', 'CHANGELOG.md', 'DEPENDENCY_GRAPH.md'];

  for (const folder of syncFolders) {
    const srcFolder = path.join(sourceDir, folder);
    const destFolder = path.join(targetAgentsDir, folder);
    if (fs.existsSync(srcFolder)) {
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
    if (fs.existsSync(srcFile)) {
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

  // Preserve plugins/
  const destPlugins = path.join(targetAgentsDir, 'plugins');
  if (fs.existsSync(destPlugins)) {
    preservedItems.push('plugins/');
  }

  return { updatedItems, preservedItems };
}

async function resolveSourcePayload() {
  const scriptDir = path.resolve(__dirname, '..');
  const localRepoAgents = path.join(scriptDir, '.agents');

  if (fs.existsSync(localRepoAgents) && fs.existsSync(path.join(localRepoAgents, 'rules'))) {
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

async function main() {
  const args = parseArgs(process.argv);
  printBanner();

  const targetDir = args.target;
  const localAgentsDest = path.join(targetDir, '.agents');
  const globalDest = path.join(process.env.HOME || process.env.USERPROFILE, '.gemini', 'config');

  console.log(`${C.blue}Command:${C.reset}      ${C.bold}${args.command.toUpperCase()}${C.reset}`);
  console.log(`${C.blue}Target Scope:${C.reset} ${C.bold}${args.mode.toUpperCase()}${C.reset}`);
  if (args.mode === 'local' || args.mode === 'all') {
    console.log(`${C.blue}Workspace:${C.reset}    ${C.bold}${targetDir}${C.reset}`);
    console.log(`${C.blue}Destination:${C.reset}  ${C.bold}${localAgentsDest}${C.reset}`);
  }
  if (args.mode === 'global' || args.mode === 'all') {
    console.log(`${C.blue}Global Path:${C.reset}  ${C.bold}${globalDest}${C.reset}`);
  }
  console.log('');

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

    if (args.dryRun) {
      console.log(`${C.yellow}[DRY-RUN] Simulation mode. No files will be modified.${C.reset}`);
      console.log(`[DRY-RUN] Would backup and update .agents/ in: ${localAgentsDest}`);
      console.log(`[DRY-RUN] Would preserve memory/ and custom configurations.`);
      console.log(`\n${C.green}✔ Dry-run completed successfully.${C.reset}`);
      process.exit(0);
    }

    const { sourceDir, tempDirToClean } = await resolveSourcePayload();

    try {
      if (args.mode === 'local' || args.mode === 'all') {
        // Create backup
        const backupPath = `${localAgentsDest}.bak.${Date.now()}`;
        console.log(`\n${C.bold}📦 Creating backup at:${C.reset} ${backupPath}`);
        copyDirSync(localAgentsDest, backupPath);

        console.log(`${C.bold}🔄 Updating .agents/ components...${C.reset}`);
        const { updatedItems, preservedItems } = updateAgentsDir(sourceDir, localAgentsDest, false);

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

      if (args.mode === 'global' || args.mode === 'all') {
        console.log(`\n${C.bold}🌐 Updating Global Configuration...${C.reset}`);
        const rulesSrc = path.join(sourceDir, 'rules');
        if (fs.existsSync(rulesSrc)) {
          copyDirSync(rulesSrc, path.join(globalDest, 'rules'));
        }
        console.log(`  ${C.green}✔ Global rules synchronized.${C.reset}`);
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
        const backupPath = `${localAgentsDest}.bak.${Date.now()}`;
        console.log(`  ${C.yellow}Creating backup at:${C.reset} ${backupPath}`);
        fs.renameSync(localAgentsDest, backupPath);
      }

      copyDirSync(sourceDir, localAgentsDest);
      console.log(`  ${C.green}✔ Installed .agents/ to:${C.reset} ${C.bold}${localAgentsDest}${C.reset}`);

      if (process.platform !== 'win32') {
        try {
          execSync(`chmod -R +x "${path.join(localAgentsDest, 'scripts')}" 2>/dev/null || true`);
        } catch (_) {}
      }
    }

    if (args.mode === 'global' || args.mode === 'all') {
      console.log(`\n${C.bold}🌐 Installing Global Configuration...${C.reset}`);
      fs.mkdirSync(path.join(globalDest, 'rules'), { recursive: true });
      fs.mkdirSync(path.join(globalDest, 'skills'), { recursive: true });

      const rulesSrc = path.join(sourceDir, 'rules');
      if (fs.existsSync(rulesSrc)) {
        copyDirSync(rulesSrc, path.join(globalDest, 'rules'));
      }

      const skillsSrc = path.join(sourceDir, 'skills');
      if (fs.existsSync(skillsSrc)) {
        copyDirSync(skillsSrc, path.join(globalDest, 'skills'));
      }

      const mcpConfigDest = path.join(globalDest, 'mcp_config.json');
      if (!fs.existsSync(mcpConfigDest)) {
        fs.writeFileSync(mcpConfigDest, JSON.stringify({ mcpServers: {} }, null, 2));
      }
      console.log(`  ${C.green}✔ Global configuration installed to:${C.reset} ${C.bold}${globalDest}${C.reset}`);
    }

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
