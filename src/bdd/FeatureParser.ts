import fs from 'node:fs';
import type { ExamplesTable, ParsedFeature, ParsedScenario, ParsedStep, StepKeyword } from './types';

const STEP_KEYWORD_PATTERN = /^(Given|When|Then|And|But)\s+(.*)$/;

/**
 * Reads a .feature file and converts its plain-text Gherkin syntax into a
 * ParsedFeature object. This is the ONLY place in the framework that reads
 * .feature files — every other layer works with the parsed structure.
 *
 * Supported syntax: Feature, Background, Scenario, Scenario Outline,
 * Given/When/Then/And/But, tags (@tag), and Examples tables.
 */
export class FeatureParser {
  static parse(filePath: string): ParsedFeature {
    const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);

    let featureName = '';
    let featureTags: string[] = [];
    const background: ParsedStep[] = [];
    const scenarios: ParsedScenario[] = [];

    let pendingTags: string[] = [];
    let mode: 'none' | 'feature' | 'background' | 'scenario' = 'none';
    let currentScenario: ParsedScenario | null = null;
    let exampleHeaders: string[] = [];

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      const lineNumber = index + 1;

      if (!line || line.startsWith('#')) {
        return;
      }

      if (line.startsWith('@')) {
        pendingTags.push(...line.split(/\s+/));
        return;
      }

      if (line.startsWith('Feature:')) {
        featureName = line.slice('Feature:'.length).trim();
        featureTags = pendingTags;
        pendingTags = [];
        mode = 'feature';
        return;
      }

      if (line.startsWith('Background:')) {
        mode = 'background';
        pendingTags = [];
        return;
      }

      if (line.startsWith('Scenario Outline:') || line.startsWith('Scenario:')) {
        const isOutline = line.startsWith('Scenario Outline:');
        const name = line.slice(line.indexOf(':') + 1).trim();
        currentScenario = { name, tags: pendingTags, steps: [], isOutline };
        scenarios.push(currentScenario);
        pendingTags = [];
        mode = 'scenario';
        exampleHeaders = [];
        return;
      }

      if (line.startsWith('Examples:')) {
        exampleHeaders = [];
        return;
      }

      if (line.startsWith('|')) {
        if (!currentScenario) {
          throw new Error(`Examples table found outside a Scenario at ${filePath}:${lineNumber}`);
        }
        const cells = line
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim());

        if (exampleHeaders.length === 0) {
          exampleHeaders = cells;
          currentScenario.examples = { headers: cells, rows: [] } satisfies ExamplesTable;
        } else {
          currentScenario.examples?.rows.push(cells);
        }
        return;
      }

      const stepMatch = STEP_KEYWORD_PATTERN.exec(line);
      if (stepMatch) {
        const [, keyword, text] = stepMatch;
        const step: ParsedStep = { keyword: keyword as StepKeyword, text: text.trim(), line: lineNumber };

        if (mode === 'background') {
          background.push(step);
        } else if (mode === 'scenario' && currentScenario) {
          currentScenario.steps.push(step);
        } else {
          throw new Error(`Step found outside Background/Scenario at ${filePath}:${lineNumber}`);
        }
        return;
      }

      if (mode === 'feature') {
        // Free-text narrative under "Feature:" (e.g. "As a user, I want... So that...").
        // It's documentation for humans and carries no executable meaning, so it's ignored.
        return;
      }

      throw new Error(`Unrecognized Gherkin syntax at ${filePath}:${lineNumber} → "${line}"`);
    });

    if (!featureName) {
      throw new Error(`No "Feature:" declaration found in ${filePath}`);
    }

    return { name: featureName, tags: featureTags, background, scenarios, filePath };
  }
}
