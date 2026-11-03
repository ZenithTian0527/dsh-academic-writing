/**
 * Structural host contracts + data shapes.
 *
 * Like dsh-scholar-panel, this plugin imports nothing from `@deepseek-ai/*`
 * at runtime: the tool-registry contract below matches the live host
 * (0.2.0-rc.2) and was read from the Cordis Inspect providers.
 * `@deepseek-ai/cordis` is a type-only import (erased at compile time).
 */
export interface Phase {
    readonly id: string;
    readonly name_zh: string;
    readonly goal: string;
    readonly steps: readonly string[];
    readonly output: string;
}
export interface Antipattern {
    readonly pattern: string;
    readonly why: string;
    readonly replace: string;
}
export interface WorkflowData {
    readonly phases: readonly Phase[];
    readonly principles: readonly string[];
    readonly antipatterns: readonly Antipattern[];
}
export interface SectionMove {
    readonly n: number;
    readonly move: string;
}
export interface SectionGuide {
    readonly id: string;
    readonly name_zh: string;
    readonly goal: string;
    readonly moves: readonly SectionMove[];
    readonly pitfalls: readonly string[];
    readonly template: string;
}
export interface SectionsData {
    readonly sections: readonly SectionGuide[];
}
export interface PolishPrinciple {
    readonly id: string;
    readonly title_zh: string;
    readonly rule: string;
}
export interface PolishData {
    readonly principles: readonly PolishPrinciple[];
    readonly compression: readonly string[];
    readonly aiClichés: {
        readonly en: readonly string[];
        readonly zh: readonly string[];
    };
    readonly checklist: readonly string[];
}
export interface CheckDimension {
    readonly id: string;
    readonly name_zh: string;
    readonly questions: readonly string[];
}
export interface ChecksData {
    readonly dimensions: readonly CheckDimension[];
}
export interface TextBlock {
    type: 'text';
    text: string;
}
export type ContentBlock = TextBlock;
export interface JsonSchemaNode {
    type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
    properties?: Record<string, JsonSchemaNode>;
    required?: string[];
    items?: JsonSchemaNode;
    enum?: Array<string | number | boolean | null>;
    additionalProperties?: boolean;
    description?: string;
    default?: unknown;
}
export interface ToolRunContextLike {
    readonly signal: AbortSignal;
    readonly name?: string;
    readonly arguments?: unknown;
    deferContext?(context: unknown): void;
    concludeTurn?(): void;
}
export interface ToolDefinitionLike {
    readonly name: string;
    readonly description: string;
    readonly parameters: Record<string, unknown>;
    readonly output: {
        readonly schema: JsonSchemaNode;
        render(args: unknown, value: unknown): ContentBlock[];
    };
    execute(args: any, exec: ToolRunContextLike): Promise<unknown>;
    timeoutMs?: number;
}
export interface ToolsServiceLike {
    register(definition: ToolDefinitionLike): () => void;
}
