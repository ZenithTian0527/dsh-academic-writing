/**
 * Offline tests (no network, no host): data integrity, renderers, entry
 * exports, and the zero-host-import invariant.
 *
 * Run: node --test test/*.test.mjs
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'

import * as entry from '../lib/index.js'
import { loadWorkflow, loadSections, loadPolish, loadChecks } from '../lib/data.js'
import { renderPlan, renderSection, renderPolish, renderChecks } from '../lib/render.js'

test('workflow.json is complete and well-formed', async () => {
  const wf = await loadWorkflow()
  assert.ok(wf.phases.length >= 4 && wf.phases.length <= 8, 'phases 4-8')
  for (const phase of wf.phases) {
    assert.ok(phase.id && phase.name_zh && phase.goal && phase.output)
    assert.ok(phase.steps.length >= 2)
  }
  assert.ok(wf.principles.length >= 6)
  assert.ok(wf.antipatterns.length >= 10)
  for (const a of wf.antipatterns) {
    assert.ok(a.pattern && a.why && a.replace)
  }
})

test('sections.json covers all six sections', async () => {
  const data = await loadSections()
  const ids = data.sections.map(s => s.id)
  assert.deepEqual([...ids].sort(), ['abstract', 'conclusion', 'experiments', 'introduction', 'method', 'related_work'])
  for (const section of data.sections) {
    assert.ok(section.name_zh && section.goal)
    assert.ok(section.moves.length >= 3, `${section.id} moves`)
    assert.ok(section.pitfalls.length >= 2, `${section.id} pitfalls`)
    assert.ok(section.template.length > 10, `${section.id} template`)
    for (const m of section.moves) assert.ok(m.n >= 1 && m.move)
  }
})

test('polish.json has principles, compression, clichés and checklist', async () => {
  const polish = await loadPolish()
  assert.ok(polish.principles.length >= 6)
  assert.ok(polish.compression.length >= 4)
  assert.ok(polish.aiClichés.en.length >= 10)
  assert.ok(polish.aiClichés.zh.length >= 8)
  assert.ok(polish.checklist.length >= 6)
  for (const p of polish.principles) assert.ok(p.id && p.title_zh && p.rule)
})

test('checks.json has the six dimensions with questions', async () => {
  const checks = await loadChecks()
  const ids = checks.dimensions.map(d => d.id)
  assert.deepEqual([...ids].sort(), ['citations', 'clarity', 'evidence', 'flow', 'structure', 'style'])
  for (const dim of checks.dimensions) {
    assert.ok(dim.name_zh)
    assert.ok(dim.questions.length >= 4, `${dim.id} questions`)
  }
})

test('renderers produce usable instructions', async () => {
  const wf = await loadWorkflow()
  const sections = await loadSections()
  const polish = await loadPolish()
  const checks = await loadChecks()

  const plan = renderPlan({ workflow: wf, topic: '测试主题' })
  assert.ok(plan.includes('测试主题') && plan.includes('执行要求'))

  const sec = renderSection({ guide: sections.sections[0], task: '任务要点' })
  assert.ok(sec.includes('写作动作') && sec.includes('任务要点') && sec.includes('可用骨架'))

  const pol = renderPolish({ polish, language: 'zh', intensity: 'normal' })
  assert.ok(pol.includes('编辑原则') && pol.includes('AI 腔') && pol.includes('执行要求'))

  const chk = renderChecks({ checks, dimensions: checks.dimensions.slice(0, 2) })
  assert.ok(chk.includes('自检清单') && chk.includes('执行要求'))
})

test('compiled entry exports name/inject/apply', async () => {
  assert.equal(entry.name, 'academic-writing')
  assert.deepEqual([...entry.inject], ['tools'])
  assert.equal(typeof entry.apply, 'function')
})

test('the built lib has no @deepseek-ai runtime imports', async () => {
  const { readFile } = await import('node:fs/promises')
  for (const file of ['index.js', 'data.js', 'render.js', 'types.js']) {
    const text = await readFile(new URL(`../lib/${file}`, import.meta.url), 'utf8')
    assert.ok(!/from\s+['"]@deepseek-ai\//u.test(text), `${file} must not import @deepseek-ai/* at runtime`)
  }
})
