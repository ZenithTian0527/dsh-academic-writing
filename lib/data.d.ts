/**
 * Lazy JSON loading for the distilled writing data (data/*.json), resolved
 * relative to `import.meta.url` so both `src/` (tests) and `lib/` (built)
 * find the package `data/` directory.
 */
import type { ChecksData, PolishData, SectionsData, WorkflowData } from './types.js';
export declare const loadWorkflow: () => Promise<WorkflowData>;
export declare const loadSections: () => Promise<SectionsData>;
export declare const loadPolish: () => Promise<PolishData>;
export declare const loadChecks: () => Promise<ChecksData>;
