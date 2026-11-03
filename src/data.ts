/**
 * Lazy JSON loading for the distilled writing data (data/*.json), resolved
 * relative to `import.meta.url` so both `src/` (tests) and `lib/` (built)
 * find the package `data/` directory.
 */

import { readFile } from 'node:fs/promises'
import type {
  ChecksData,
  PolishData,
  SectionsData,
  WorkflowData,
} from './types.js'

const cache = new Map<string, unknown>()

async function loadJson<T>(name: string): Promise<T> {
  const cached = cache.get(name)
  if (cached !== undefined) return cached as T
  const url = new URL(`../data/${name}.json`, import.meta.url)
  const raw = await readFile(url, 'utf8')
  const parsed = JSON.parse(raw) as T
  cache.set(name, parsed)
  return parsed
}

export const loadWorkflow = (): Promise<WorkflowData> => loadJson<WorkflowData>('workflow')
export const loadSections = (): Promise<SectionsData> => loadJson<SectionsData>('sections')
export const loadPolish = (): Promise<PolishData> => loadJson<PolishData>('polish')
export const loadChecks = (): Promise<ChecksData> => loadJson<ChecksData>('checks')
