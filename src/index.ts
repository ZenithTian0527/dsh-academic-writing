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

import type { Context } from '@deepseek-ai/cordis'
import type {
  CheckDimension,
  ToolsServiceLike,
} from './types.js'
import { loadChecks, loadPolish, loadSections, loadWorkflow } from './data.js'
import { renderChecks, renderPlan, renderPolish, renderSection } from './render.js'

export const name = 'academic-writing'
export const inject = ['tools'] as const

const SECTION_IDS = ['abstract', 'introduction', 'method', 'experiments', 'related_work', 'conclusion'] as const
const DIMENSION_IDS = ['flow', 'clarity', 'structure', 'evidence', 'citations', 'style'] as const

function asText(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim() !== '') return value
  return fallback
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

export function apply(ctx: Context): void {
  const tools = ctx.get('tools') as unknown as ToolsServiceLike | undefined
  if (tools === undefined || typeof tools.register !== 'function') {
    throw new Error('dsh-academic-writing: the tools service is unavailable')
  }

  /* ---------------- paper_plan ---------------- */

  tools.register({
    name: 'paper_plan',
    description:
      'Plan an academic paper: refine the core contribution, pick a structure and produce an outline, following a structured writing pipeline (brainstorm → outline → draft → evaluate → revise). Use when the user wants to start or restructure a paper.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: '研究主题、问题或已有想法；省略则从对话上下文推断。',
        },
        paper_type: {
          type: 'string',
          enum: ['research', 'survey', 'position', 'technical_report'],
          description: '论文类型。默认 research。',
        },
        stage: {
          type: 'string',
          enum: ['brainstorm', 'outline', 'full'],
          description: 'brainstorm=只打磨选题；outline=推进到大纲；full=给出全流程指导。默认 full。',
        },
        language: {
          type: 'string',
          enum: ['zh', 'en'],
          description: '论文语言。默认 zh。',
        },
      },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => [{ type: 'text', text: renderPlan(value) }],
    },
    execute: async (args) => {
      const workflow = await loadWorkflow()
      const stage = asEnum(args.stage, ['brainstorm', 'outline', 'full'] as const, 'full')
      return {
        workflow,
        topic: asText(args.topic, ''),
        paper_type: asEnum(args.paper_type, ['research', 'survey', 'position', 'technical_report'] as const, 'research'),
        language: asEnum(args.language, ['zh', 'en'] as const, 'zh'),
        stage,
      }
    },
  })

  /* ---------------- paper_write ---------------- */

  tools.register({
    name: 'paper_write',
    description:
      'Get section-specific writing guidance (ordered rhetorical moves, template skeleton, common pitfalls) for one section of an academic paper, then write or revise that section. Use when the user asks to draft or fix a specific section.',
    parameters: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: [...SECTION_IDS],
          description: '要写的小节：abstract 摘要 / introduction 引言 / method 方法 / experiments 实验 / related_work 相关工作 / conclusion 结论。',
        },
        task: {
          type: 'string',
          description: '本节必须传达的内容要点（核心贡献、方法概述、结果摘要等）。',
        },
        language: {
          type: 'string',
          enum: ['zh', 'en'],
          description: '论文语言。默认 zh。',
        },
      },
      required: ['section'],
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => [{ type: 'text', text: renderSection(value) }],
    },
    execute: async (args) => {
      const sections = await loadSections()
      const sectionId = asEnum(args.section, SECTION_IDS, 'abstract')
      const guide = sections.sections.find(item => item.id === sectionId)
      if (guide === undefined) throw new Error(`unknown section: ${String(args.section)}`)
      return {
        guide,
        task: asText(args.task, ''),
        language: asEnum(args.language, ['zh', 'en'] as const, 'zh'),
      }
    },
  })

  /* ---------------- paper_polish ---------------- */

  tools.register({
    name: 'paper_polish',
    description:
      'Polish academic writing: apply editorial principles, remove AI-sounding clichés, compress wordiness and improve clarity, then output the polished text plus a summary of the changes. Use when the user asks to 润色, improve the writing, or make text read more naturally.',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '要润色的文本（直接粘贴，或先读取文件再把内容传入）。',
        },
        language: {
          type: 'string',
          enum: ['zh', 'en'],
          description: '文本语言。默认 zh。',
        },
        intensity: {
          type: 'string',
          enum: ['light', 'normal', 'thorough'],
          description: 'light=只清除 AI 腔与明显语病；normal=按编辑原则完整润色；thorough=大幅压缩与重写。默认 normal。',
        },
        style: {
          type: 'string',
          enum: ['academic', 'concise', 'native'],
          description: 'academic=学术正式；concise=尽量压缩；native=贴近母语表达。默认 academic。',
        },
      },
      required: ['text'],
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => [{ type: 'text', text: renderPolish(value) }],
    },
    execute: async (args) => {
      const polish = await loadPolish()
      const text = asText(args.text, '').trim()
      if (text === '') throw new Error('text is empty: provide the text to polish')
      return {
        polish,
        language: asEnum(args.language, ['zh', 'en'] as const, 'zh'),
        intensity: asEnum(args.intensity, ['light', 'normal', 'thorough'] as const, 'normal'),
        style: asEnum(args.style, ['academic', 'concise', 'native'] as const, 'academic'),
      }
    },
  })

  /* ---------------- paper_check ---------------- */

  tools.register({
    name: 'paper_check',
    description:
      'Run a structured self-review of a draft against checklists across dimensions (flow, clarity, structure, evidence, citations, style); report issues with quoted locations and concrete fixes. Use after drafting or before submission.',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '草稿内容；省略则从对话上下文或用户提供的文件检查。',
        },
        dimensions: {
          type: 'array',
          items: { type: 'string', enum: [...DIMENSION_IDS] },
          description: '自检维度：flow 行文流畅 / clarity 清晰具体 / structure 结构逻辑 / evidence 证据与实验 / citations 引用与相关工作 / style 语言与格式。省略=全部。',
        },
        language: {
          type: 'string',
          enum: ['zh', 'en'],
          description: '草稿语言。默认 zh。',
        },
      },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => [{ type: 'text', text: renderChecks(value) }],
    },
    execute: async (args) => {
      const checks = await loadChecks()
      const wanted: string[] | undefined = Array.isArray(args.dimensions)
        ? (args.dimensions as unknown[]).filter((item: unknown): item is string => typeof item === 'string')
        : undefined
      let dimensions: CheckDimension[]
      if (wanted === undefined || wanted.length === 0) {
        dimensions = [...checks.dimensions]
      } else {
        const byId = new Map(checks.dimensions.map(dim => [dim.id, dim] as const))
        dimensions = wanted
          .map(id => byId.get(id))
          .filter((dim): dim is CheckDimension => dim !== undefined)
      }
      if (dimensions.length === 0) throw new Error('no valid dimensions selected')
      return {
        checks: { dimensions },
        dimensions,
        language: asEnum(args.language, ['zh', 'en'] as const, 'zh'),
      }
    },
  })
}
