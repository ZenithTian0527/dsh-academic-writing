/**
 * Lazy JSON loading for the distilled writing data (data/*.json), resolved
 * relative to `import.meta.url` so both `src/` (tests) and `lib/` (built)
 * find the package `data/` directory.
 */
import { readFile } from 'node:fs/promises';
const cache = new Map();
async function loadJson(name) {
    const cached = cache.get(name);
    if (cached !== undefined)
        return cached;
    const url = new URL(`../data/${name}.json`, import.meta.url);
    const raw = await readFile(url, 'utf8');
    const parsed = JSON.parse(raw);
    cache.set(name, parsed);
    return parsed;
}
export const loadWorkflow = () => loadJson('workflow');
export const loadSections = () => loadJson('sections');
export const loadPolish = () => loadJson('polish');
export const loadChecks = () => loadJson('checks');
