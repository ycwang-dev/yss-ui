/**
 * MCP 工具定义与处理器：全部基于本地索引，零网络、确定性。
 */

const { DocStore } = require('./store');

/** 工具定义（tools/list 返回的 JSON Schema）。 */
const TOOL_DEFINITIONS = [
  {
    name: 'list_components',
    description:
      '列出 YSS UI 全部组件、Hooks 与工具函数（名称、说明、文档路径）。生成业务代码前先用它确认组件真实存在，禁止虚构 Y 前缀组件。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_component_docs',
    description:
      '获取指定组件/Hook/工具函数的文档。默认返回 API 章节（props/events/slots/methods 配置项）；section=full 返回完整文档。写任何 YSS UI 组件配置前必查，不要凭记忆猜配置项。',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '组件名，支持 YTable / y-table / table / 表格 / useTableHeight 等写法',
        },
        section: {
          type: 'string',
          enum: ['api', 'full'],
          description: '返回范围：api（默认，仅 API 章节）或 full（完整文档）',
        },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_demo',
    description:
      '获取组件官方 Demo 的完整源码（index.vue、hooks、样式）。不传 demo 参数时列出该组件全部可用 Demo。实现表单三态、回显、可编辑表格等场景前，先对照官方 Demo 的标准写法。',
    inputSchema: {
      type: 'object',
      properties: {
        component: { type: 'string', description: '组件名（同 get_component_docs 的 name）' },
        demo: { type: 'string', description: 'Demo 标识（由不传该参数时返回的列表获得）' },
      },
      required: ['component'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_docs',
    description:
      '按关键词在全部组件文档与 Skills 中做全文搜索（支持中文），返回最相关章节片段。不确定某个配置/写法在哪个组件文档里时使用。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '查询语句，如 "表单编辑回显" / "行拖拽" / "editConfig"' },
        limit: { type: 'number', description: '返回条数，默认 5' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_skills',
    description: '列出全部 YSS UI 开发 Skills（技能规范）及其触发场景描述。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_skill',
    description:
      '获取指定 Skill 的完整内容（触发条件、硬约束、标准代码骨架、失败兜底）。实现列表页/表单/可编辑表格等业务模块前按 list_skills 选择并读取对应 Skill。',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Skill 名称，如 page-form-module、ytable-usage' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_codegen_rules',
    description:
      '获取 YSS UI 业务代码生成硬规则（样式导入、SFC 结构、主题 Token、大数精度等强制约定）。生成任何业务代码前必读一次。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

/**
 * 渲染 Demo 源码为带文件头的 markdown。
 *
 * @param {object} demo demo 条目
 * @returns {string} markdown 文本
 */
function renderDemo(demo) {
  const parts = [`# Demo: ${demo.id}${demo.title ? ` — ${demo.title}` : ''}`];
  for (const file of demo.files) {
    const lang = file.path.split('.').pop();
    parts.push(`\n## ${file.path}\n\n\`\`\`${lang}\n${file.content}\n\`\`\``);
  }
  return parts.join('\n');
}

/**
 * 执行工具调用。
 *
 * @param {DocStore} store 文档索引仓库
 * @param {string} name 工具名
 * @param {object} args 工具入参
 * @returns {string} 文本结果
 */
function handleToolCall(store, name, args = {}) {
  switch (name) {
    case 'list_components': {
      const groups = {
        component: '## 组件（@yss-ui/components）',
        hook: '## Hooks（@yss-ui/hooks）',
        util: '## 工具函数（@yss-ui/utils）',
      };
      const lines = [`YSS UI v${store.index.componentsVersion}（索引生成于 ${store.index.generatedAt}）`];
      for (const [type, title] of Object.entries(groups)) {
        const entries = store.index.entries.filter(entry => entry.type === type);
        if (entries.length === 0) continue;
        lines.push('', title, '');
        for (const entry of entries) {
          lines.push(`- ${entry.title}（id: ${entry.id}，分类: ${entry.category}，demos: ${entry.demos.length}）`);
        }
      }
      return lines.join('\n');
    }

    case 'get_component_docs': {
      const entry = store.resolveEntry(args.name);
      if (!entry) {
        return `未找到 "${args.name}"。请先用 list_components 查看真实存在的组件——不要使用虚构组件。`;
      }
      const demoList = entry.demos.length
        ? `\n\n---\n可用 Demo（用 get_demo 获取源码）:\n${entry.demos.map(demo => `- ${demo.id}${demo.title ? `: ${demo.title}` : ''}`).join('\n')}`
        : '';
      if ((args.section || 'api') === 'full') {
        return `# ${entry.title}\n\n${entry.doc}${demoList}`;
      }
      const api = DocStore.extractSection(entry.doc, 'API');
      if (!api) {
        return `# ${entry.title}\n\n（该文档没有独立 API 章节，返回完整文档）\n\n${entry.doc}${demoList}`;
      }
      return `# ${entry.title}\n\n${api}${demoList}`;
    }

    case 'get_demo': {
      const entry = store.resolveEntry(args.component);
      if (!entry) {
        return `未找到组件 "${args.component}"。请先用 list_components 确认组件名。`;
      }
      if (!args.demo) {
        if (entry.demos.length === 0) return `${entry.title} 没有独立 Demo，请用 get_component_docs 查看文档内示例。`;
        return `${entry.title} 的可用 Demo:\n${entry.demos.map(demo => `- ${demo.id}${demo.title ? `: ${demo.title}` : ''}`).join('\n')}`;
      }
      const wanted = String(args.demo).toLowerCase();
      const demo =
        entry.demos.find(item => item.id.toLowerCase() === wanted) ||
        entry.demos.find(item => item.id.toLowerCase().includes(wanted));
      if (!demo) {
        return `未找到 Demo "${args.demo}"。可用: ${entry.demos.map(item => item.id).join(', ') || '（无）'}`;
      }
      return renderDemo(demo);
    }

    case 'search_docs': {
      const hits = store.search(args.query, Math.min(Math.max(Number(args.limit) || 5, 1), 20));
      if (hits.length === 0) {
        return `没有找到与 "${args.query}" 相关的内容。请换用组件名或配置项关键词，或用 list_components 浏览。`;
      }
      return hits
        .map(
          (hit, i) =>
            `## ${i + 1}. ${hit.source} > ${hit.heading}（相关度 ${hit.score.toFixed(2)}）\n\n${hit.snippet}${hit.snippet.length >= 400 ? '\n…（截断，用 get_component_docs / get_skill 看全文）' : ''}`
        )
        .join('\n\n');
    }

    case 'list_skills': {
      const byCategory = new Map();
      for (const skill of store.index.skills) {
        if (!byCategory.has(skill.category)) byCategory.set(skill.category, []);
        byCategory.get(skill.category).push(skill);
      }
      const lines = [];
      for (const [category, skills] of byCategory) {
        lines.push(`## ${category}`, '');
        for (const skill of skills) {
          lines.push(`- ${skill.name}: ${skill.description}`);
        }
        lines.push('');
      }
      return lines.join('\n').trim();
    }

    case 'get_skill': {
      const wanted = String(args.name || '')
        .toLowerCase()
        .trim();
      const skill =
        store.index.skills.find(item => item.name === wanted) ||
        store.index.skills.find(item => item.name.includes(wanted));
      if (!skill) {
        return `未找到 Skill "${args.name}"。用 list_skills 查看全部可用 Skill。`;
      }
      return `# Skill: ${skill.name}\n\n> ${skill.description}\n\n${skill.content}`;
    }

    case 'get_codegen_rules': {
      return `# YSS UI 业务代码生成硬规则\n\n${store.index.codegenRules}`;
    }

    default:
      throw new Error(`未知工具: ${name}`);
  }
}

module.exports = { TOOL_DEFINITIONS, handleToolCall };
