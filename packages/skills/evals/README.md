# Skills 评测（evals）

本目录存放 skills 的确定性评测数据，配套仓库级门禁脚本运行，不随 skill 同步到
`.agent/skills`（`skills.config.json` 只同步分类内的 skill 目录）。

设计参考 awesome-llm-apps 的 `agent_skills/evals` 分层评测模型，当前落地两层零模型依赖的检查：

| 层级 | 检查内容 | 脚本 |
| --- | --- | --- |
| 触发与路由 | 正例 prompt 必须路由到正确 skill 且显著压过 near-miss 负例；任何两个 description 词表不得近似碰撞 | `scripts/run-trigger-evals.js` |
| 安全扫描 | 远程脚本管道执行、混淆载荷、凭据读取、安装诱导、外传组合 | `scripts/scan-skills-security.js` |

## 运行

```bash
pnpm eval:skills   # 触发与路由评测
pnpm scan:skills   # 安全扫描
```

两者均已并入 `pnpm validate:skills`（prebuild 自动执行）。

## trigger-cases.json 格式

每个 skill 一个目录：`evals/<skill-name>/trigger-cases.json`。

```json
{
  "skill": "page-form-module",
  "purpose": "触发行为规约：确定性词法路由 + 人工行为核对",
  "cases": [
    {
      "id": "edit-echo-missing",
      "prompt": "编辑弹窗打开后表单数据回显不出来",
      "should_trigger": true,
      "assert": "定位回显链路（详情接口、setValues 时机、mode），给出修复"
    },
    {
      "id": "near-miss-query-layout",
      "prompt": "查询表单的栅格布局怎么排",
      "should_trigger": false,
      "assert": "查询表单布局归 formily-foundation，不触发本 skill"
    }
  ]
}
```

字段说明：

- `prompt`：用户实际会说的话术（中文为主，保留组件名等标识符）。
- `should_trigger`：该话术是否应触发本 skill。负例应是"近似但不该触发"的 near-miss，
  而不是毫不相关的话术，否则测不出边界。
- `assert`：触发后期望的行为，供人工行为核对（本层不校验语义）。
- `accept_route_to`（可选）：正例允许路由到的替代 skill 列表。仅用于刻意的
  枢纽/别名关系（如 `yss-formily` 是 formily 细分技能的入口），不要用来掩盖真实的路由冲突。
- `lexical: false`（可选）：跳过词法检查，该用例依赖语义推理触发，由人工行为核对覆盖。

## 判定机制（与脚本实现一致）

- 分词 = 中文二元组 + 英文单词（轻词干化）；出现在超过 40% description 中的词
  视为模板背景词汇，不参与打分。
- 得分 = 命中判别词数 / sqrt(prompt 词元数)。
- 每个正例必须在全目录全部已配置 skill 中把自己排在第一（或 `accept_route_to` 内）。
- 每个 skill 的最弱正例得分必须超过最强负例得分的 1.15 倍。
- 任何两个 description 的判别词重叠超过 50% 即失败；刻意的成对变体
  写入 `evals.config.json` 的 `collisionAllowlist` 并说明原因。

评测失败的修法几乎总是**改 description**：补上用户实际会说的词汇，或收窄
过于宽泛的措辞——description 就是 skill 的全部触发面。
