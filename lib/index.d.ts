/**
 * dsh-academic-writing — 学术写作与润色插件。
 *
 * Registers four tools (all agent-backend: the tool returns distilled
 * writing data and the agent performs the writing, polishing and checking):
 *
 *  - `paper_plan`   — 论文规划：写作流水线 + 全局原则 + 坏写法清单。
 *  - `paper_write`  — 分节写作指南：修辞动作、模板与常见错误。
 *  - `paper_polish` — 学术润色：编辑原则、AI 腔清除、压缩手法与自检。
 *  - `paper_check`  — 结构化自检清单（六维度）。
 *
 * The bundled data/ files are adapted from the MIT-licensed GitHub skills
 * Master-cai/Research-Paper-Writing-Skills (彭思达公开笔记整理，面向 Codex /
 * Claude Code / Gemini) and SNL-UCSB/paper-writing-skill — see LICENSE.
 *
 * Zero runtime imports from `@deepseek-ai/*`; every host contract is
 * structural (types.ts), so the plugin cannot break on host version drift.
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "academic-writing";
export declare const inject: readonly ["tools"];
export declare function apply(ctx: Context): void;
