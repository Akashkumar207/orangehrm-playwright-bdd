/**
 * Shared type definitions for the manual BDD engine.
 * These types describe the structure produced by FeatureParser and
 * consumed by BDDRunner — nothing here executes anything.
 */

export type StepKeyword = 'Given' | 'When' | 'Then' | 'And' | 'But';

export interface ParsedStep {
  keyword: StepKeyword;
  text: string;
  line: number;
}

export interface ExamplesTable {
  headers: string[];
  rows: string[][];
}

export interface ParsedScenario {
  name: string;
  tags: string[];
  steps: ParsedStep[];
  isOutline: boolean;
  examples?: ExamplesTable;
}

export interface ParsedFeature {
  name: string;
  tags: string[];
  background: ParsedStep[];
  scenarios: ParsedScenario[];
  filePath: string;
}

/** A scenario after Scenario Outline + Examples have been expanded into concrete cases. */
export interface ExecutableScenario {
  name: string;
  tags: string[];
  steps: ParsedStep[];
}
