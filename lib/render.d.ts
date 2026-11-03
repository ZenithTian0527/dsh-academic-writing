/**
 * Text renderers for the four tools. Each renderer turns the JSON value
 * returned by a tool's execute() into one plain-text block the agent reads
 * and then acts on (agent backend: the agent performs the actual writing).
 */
import type { SectionsData } from './types.js';
export declare function renderPlan(value: unknown): string;
export declare function renderSection(value: unknown): string;
export declare function renderPolish(value: unknown): string;
export declare function renderChecks(value: unknown): string;
export type { SectionsData };
