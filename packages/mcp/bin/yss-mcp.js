#!/usr/bin/env node

const command = process.argv[2];

if (command === 'install') {
  const { run } = require('../lib/install');
  run(process.argv.slice(3)).catch(error => {
    console.error(`安装失败: ${error.message}`);
    process.exit(1);
  });
} else if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`yss-mcp — YSS UI 文档 MCP Server

用法:
  yss-mcp                     启动 stdio MCP Server（供 AI 工具调用，默认）
  yss-mcp install             交互式安装到 12 个主流 AI 工具（Cursor/Codex/Claude Code/Antigravity/Trae/Qoder/Kiro/Windsurf/VS Code/Cline/Gemini CLI/Copilot CLI）
  yss-mcp install <目标...>   直接安装，如: yss-mcp install cursor codex --global
  yss-mcp help                显示本帮助`);
} else {
  const { main } = require('../lib/server');
  main().catch(error => {
    console.error(`yss-mcp 启动失败: ${error.message}`);
    process.exit(1);
  });
}
