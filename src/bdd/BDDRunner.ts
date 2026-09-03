import type { TestType } from '@playwright/test';
import { FeatureParser } from './FeatureParser';
import { stepRegistry } from './StepRegistry';
import type { ExecutableScenario, ParsedFeature, ParsedScenario, ParsedStep } from './types';
import { Logger } from '../utils/Logger';

/**
 * The BDD engine is deliberately decoupled from Playwright's fixture shape:
 * `test.fixture.ts` (Phase 9) extends Playwright's `test` with page objects,
 * and this runner just needs to invoke whatever `test` it is given. `any`
 * here is the same pattern Playwright itself uses when typing custom test
 * extensions — the concrete fixture shape is only known at the call site.
 */
type AnyTest = TestType<any, any>;

/**
 * Expands every Scenario Outline into one concrete scenario per Examples
 * row, substituting <placeholder> tokens in each step's text with that
 * row's values. Regular Scenarios pass through unchanged.
 */
function expandScenarios(scenarios: ParsedScenario[]): ExecutableScenario[] {
  return scenarios.flatMap((scenario): ExecutableScenario[] => {
    if (!scenario.isOutline || !scenario.examples) {
      return [{ name: scenario.name, tags: scenario.tags, steps: scenario.steps }];
    }

    const { headers, rows } = scenario.examples;

    return rows.map((row) => {
      const steps: ParsedStep[] = scenario.steps.map((step) => ({
        ...step,
        text: headers.reduce((text, header, columnIndex) => text.split(`<${header}>`).join(row[columnIndex]), step.text),
      }));

      const rowDescription = headers.map((header, i) => `${header}=${row[i]}`).join(', ');
      return { name: `${scenario.name} (${rowDescription})`, tags: scenario.tags, steps };
    });
  });
}

/**
 * Appends tags to the Playwright test title (e.g. "Successful login @smoke
 * @authentication") so tag-based execution works through Playwright's own
 * `--grep` flag — no custom filtering logic needed.
 */
function titleWithTags(scenario: ExecutableScenario): string {
  return scenario.tags.length > 0 ? `${scenario.name} ${scenario.tags.join(' ')}` : scenario.name;
}

async function runSteps(steps: ParsedStep[], world: unknown, feature: ParsedFeature): Promise<void> {
  for (const step of steps) {
    Logger.info(`${step.keyword} ${step.text}`);

    const resolved = stepRegistry.resolve(step.text);
    if (!resolved) {
      throw new Error(
        `No step definition matches: "${step.keyword} ${step.text}" ` +
          `(${feature.filePath}:${step.line}). Add a matching Given/When/Then in src/steps/.`,
      );
    }
    await resolved.handler(world, ...resolved.args);
  }
}

/**
 * Parses a .feature file and registers it as Playwright tests: one
 * `test.describe` block per Feature, one `test` per Scenario (Scenario
 * Outlines are expanded into one test per Examples row). Each test runs the
 * Background steps followed by the scenario's own steps, resolving every
 * step against whatever step definitions have been imported by the caller.
 *
 * Call this once per spec file, after importing the relevant step
 * definition modules (imported purely for their registration side effect).
 *
 * IMPORTANT: Playwright statically inspects a test callback's parameter
 * list — as literal source text — to know which fixtures to inject.
 * Neither a plain parameter (`async (world) => ...`) nor a rest pattern
 * (`async ({ ...world }) => ...`) is allowed; every fixture must be
 * destructured by name below. This means the destructuring list must be
 * kept in sync by hand with every fixture defined in
 * `src/fixtures/test.fixture.ts` — when a new page object fixture is added
 * there, add its name here too, or steps that destructure it will receive
 * `undefined`. Fixtures are cheap Page Object wrappers, so requesting all
 * of them on every generated test has no meaningful cost.
 */
export function runFeature(test: AnyTest, featurePath: string): void {
  const feature = FeatureParser.parse(featurePath);
  const scenarios = expandScenarios(feature.scenarios);

  test.describe(feature.name, () => {
    for (const scenario of scenarios) {
      test(titleWithTags(scenario), async ({ page, loginPage, dashboardPage, forgotPasswordPage, pimPage, addEmployeePage }) => {
        Logger.info(`Scenario: ${scenario.name}`);
        // `context` is a plain object steps can freely stash values into
        // (e.g. an app-generated Employee Id) so a later step in the same
        // scenario can read it back — the same role Cucumber's `this`
        // plays as its shared "World" object. One fresh object per test.
        const world = { page, loginPage, dashboardPage, forgotPasswordPage, pimPage, addEmployeePage, context: {} };
        await runSteps(feature.background, world, feature);
        await runSteps(scenario.steps, world, feature);
      });
    }
  });
}
