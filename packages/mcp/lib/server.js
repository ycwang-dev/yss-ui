/**
 * @yss/mcp — YSS UI 文档 MCP Server（stdio）。
 *
 * 基于 @modelcontextprotocol/sdk 低层 API，全部数据来自随包发布的
 * data/index.json 快照，零网络、可离线运行。
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { DocStore } = require('./store');
const { TOOL_DEFINITIONS, handleToolCall } = require('./tools');
const { version } = require('../package.json');

/** 启动 stdio MCP Server。 */
async function main() {
  const store = new DocStore();

  const server = new Server({ name: 'yss-mcp', version }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOL_DEFINITIONS }));

  server.setRequestHandler(CallToolRequestSchema, request => {
    const { name, arguments: args } = request.params;
    try {
      const text = handleToolCall(store, name, args || {});
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return { content: [{ type: 'text', text: `工具执行失败: ${error.message}` }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `yss-mcp v${version} 已启动（YSS UI v${store.index.componentsVersion}，${store.index.entries.length} 个文档条目）`
  );
}

module.exports = { main };
