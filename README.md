# dsh-academic-writing

学术写作与润色插件 · Academic writing & polishing plugin for DeepSeek Harness.

把 GitHub 上针对 **Claude Code / Codex** 的 research paper writing skills 改写成了 DSH 原生插件：写作方法论以数据形式内置，agent 按需取用并执行。

## 内容来源（MIT 协议）

- [Master-cai/Research-Paper-Writing-Skills](https://github.com/Master-cai/Research-Paper-Writing-Skills)（7.5k+ ⭐，整理自彭思达教授公开写作笔记，原面向 Codex / Claude Code / Gemini）
- [SNL-UCSB/paper-writing-skill](https://github.com/SNL-UCSB/paper-writing-skill)（编辑原则与压缩手法）

详见 LICENSE。

## 安装

```sh
dsh plugin --profile web add file:/path/to/dsh-academic-writing
```

无需重启；新会话即可调用（工具热注册）。

## 四个工具

| 工具 | 用途 | 典型问法 |
| --- | --- | --- |
| `paper_plan` | 论文规划：写作流水线（头脑风暴→大纲→草稿→评估→修改）+ 全局原则 + 坏写法清单 | 「帮我规划一篇关于 X 的论文」「帮我把这个想法打磨成可写的选题」 |
| `paper_write` | 分节写作指南：摘要/引言/方法/实验/相关工作/结论的修辞动作、模板与常见错误 | 「按指南写引言」「帮我重写方法一节」 |
| `paper_polish` | 学术润色：编辑原则、AI 腔清除、压缩手法、润色后自检 | 「把这段润色一下，学术正式风格」「帮我改掉 AI 味」 |
| `paper_check` | 结构化自检：行文/清晰/结构/证据/引用/风格六维度清单 | 「提交前帮我全面自检这篇论文」 |

参数说明：`paper_polish` 支持 `intensity`（light/normal/thorough）与 `style`（academic/concise/native）；`paper_check` 支持按维度挑选；所有工具支持 `language`（zh/en）。

## 架构

- **零宿主运行时依赖**：不 import 任何 `@deepseek-ai/*` 包，宿主契约以结构性类型声明，不会因宿主升级而失效。
- **方法论即数据**：`data/*.json`（workflow / sections / polish / checks）纯数据，想增补自己导师的写作要求或期刊规范，直接改 JSON 即可。
- **agent 后端**：工具返回方法论与规程，由 agent 亲自执笔（结合全文语境），不额外调用模型、无隐藏成本。

## 开发

```sh
pnpm install
pnpm check   # typecheck + build + 离线测试
```

## License

MIT（方法论内容改编自上述两个 MIT 协议开源项目）。
