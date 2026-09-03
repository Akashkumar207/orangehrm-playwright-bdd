/**
 * A step definition's handler. The first argument is the "world" — whatever
 * context object the runner passes in (in this framework, Playwright's
 * fixtures object containing `page` and page objects). Remaining arguments
 * are the values captured from {string} / {int} placeholders in the pattern.
 *
 * `World`/`unknown[]` intentionally stay loose here: the number and type of
 * captured arguments depends on each individual pattern and is only known
 * at the call site (the step definition file), not by the registry itself.
 * This mirrors how Cucumber's own step definition typings work.
 */
export type StepHandler<World = unknown> = (world: World, ...args: unknown[]) => Promise<void> | void;

type ParamType = 'string' | 'int';

interface RegisteredStep {
  source: string;
  regex: RegExp;
  paramTypes: ParamType[];
  handler: StepHandler;
}

export interface ResolvedStep {
  handler: StepHandler;
  args: unknown[];
}

const PLACEHOLDER_PATTERN = /\{string\}|\{int\}/g;
const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

function escapeRegex(text: string): string {
  return text.replace(REGEX_SPECIAL_CHARS, '\\$&');
}

/**
 * Converts a Cucumber-style step pattern (e.g. `I login with username
 * "{string}" and password "{string}"`) into a regular expression, tracking
 * which placeholder types appear so captured values can be converted to the
 * right JavaScript type (string vs number) when the step actually runs.
 */
function compilePattern(pattern: string): { regex: RegExp; paramTypes: ParamType[] } {
  const paramTypes: ParamType[] = [];
  let compiled = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  PLACEHOLDER_PATTERN.lastIndex = 0;
  while ((match = PLACEHOLDER_PATTERN.exec(pattern)) !== null) {
    compiled += escapeRegex(pattern.slice(lastIndex, match.index));

    if (match[0] === '{string}') {
      compiled += '"([^"]*)"';
      paramTypes.push('string');
    } else {
      compiled += '(\\d+)';
      paramTypes.push('int');
    }

    lastIndex = match.index + match[0].length;
  }
  compiled += escapeRegex(pattern.slice(lastIndex));

  return { regex: new RegExp(`^${compiled}$`), paramTypes };
}

/**
 * Holds every registered step definition and resolves a plain-text Gherkin
 * step (e.g. "I login with username \"Admin\" and password \"admin123\"")
 * to its matching handler and captured arguments.
 *
 * There is deliberately only ONE registry, shared by Given/When/Then/And/But.
 * Cucumber-style frameworks match steps by TEXT ONLY, not by keyword — the
 * keyword in a .feature file is documentation for humans, not a routing key.
 */
export class StepRegistry {
  private readonly steps: RegisteredStep[] = [];

  register(pattern: string, handler: StepHandler): void {
    const existing = this.steps.find((step) => step.source === pattern);
    if (existing) {
      throw new Error(`Duplicate step definition for pattern: "${pattern}"`);
    }

    const { regex, paramTypes } = compilePattern(pattern);
    this.steps.push({ source: pattern, regex, paramTypes, handler });
  }

  resolve(stepText: string): ResolvedStep | undefined {
    for (const step of this.steps) {
      const match = step.regex.exec(stepText);
      if (!match) {
        continue;
      }

      const args = match.slice(1).map((value, index) => (step.paramTypes[index] === 'int' ? Number(value) : value));
      return { handler: step.handler, args };
    }

    return undefined;
  }

  /** Removes all registered steps. Used by tests to isolate the registry between runs. */
  reset(): void {
    this.steps.length = 0;
  }
}

/** Single shared registry instance used across the whole framework. */
export const stepRegistry = new StepRegistry();

/**
 * `Args` lets a step definition declare the real type of its captured
 * {string}/{int} values (e.g. `When<World, [string, string]>(...)`) instead
 * of receiving `unknown[]` and having to cast in every step file. The cast
 * to `StepHandler` happens once, here, rather than being repeated in every
 * step definition — step files stay simple and business-readable.
 */
type StepDefinitionFn = <World = unknown, Args extends unknown[] = unknown[]>(
  pattern: string,
  handler: (world: World, ...args: Args) => Promise<void> | void,
) => void;

const defineStep: StepDefinitionFn = (pattern, handler) => {
  stepRegistry.register(pattern, handler as StepHandler);
};

export const Given: StepDefinitionFn = defineStep;
export const When: StepDefinitionFn = defineStep;
export const Then: StepDefinitionFn = defineStep;
