import path from 'node:path';
import { createAIClient, type AIClient } from '../AIClient';
import { renderPrompt } from '../PromptTemplate';
import { parseFields } from '../ResponseParser';

const PROMPT_PATH = path.join(__dirname, '../prompts/failure-analysis.prompt.md');

export type FailureCategory =
  | 'locator'
  | 'timeout'
  | 'application-defect'
  | 'environment'
  | 'synchronization'
  | 'test-data'
  | 'unknown';

export interface FailureAnalysisRequest {
  testName: string;
  errorMessage: string;
  currentUrl?: string;
  /** Path to a screenshot — e.g. one produced by ScreenshotUtils.captureFailure(). */
  screenshotPath?: string;
  /** Recent lines from logs/test-run.log, most relevant last. */
  relevantLogs?: string[];
}

export interface FailureAnalysisResult {
  category?: FailureCategory;
  rootCause?: string;
  suggestedFix?: string;
  confidence?: 'low' | 'medium' | 'high';
  raw: string;
}

/**
 * Classifies a test failure using the same evidence a human would look at
 * first: the error, the screenshot, the URL, and recent logs — exactly
 * what test.fixture.ts's failure branch (Phase 10/11) already collects.
 *
 * This is intentionally NOT wired into test.fixture.ts to run automatically
 * on every failure: that would mean every CI red build makes a live network
 * call to an LLM, adding cost, latency, and an external dependency to the
 * test run itself. An engineer invokes this deliberately when investigating
 * a failure, the same way they'd open a screenshot or a trace by hand.
 */
export class FailureAnalysisAgent {
  constructor(private readonly client: AIClient = createAIClient()) {}

  async analyze(request: FailureAnalysisRequest): Promise<FailureAnalysisResult> {
    const prompt = renderPrompt(PROMPT_PATH, {
      testName: request.testName,
      errorMessage: request.errorMessage,
      currentUrl: request.currentUrl ?? '(not captured)',
      screenshotPath: request.screenshotPath ?? '(not captured)',
      relevantLogs: (request.relevantLogs ?? []).join('\n') || '(none)',
    });

    const raw = await this.client.complete(prompt);
    const fields = parseFields(raw, ['FAILURE_CATEGORY', 'ROOT_CAUSE', 'SUGGESTED_FIX', 'CONFIDENCE']);

    return {
      category: fields.FAILURE_CATEGORY as FailureCategory | undefined,
      rootCause: fields.ROOT_CAUSE,
      suggestedFix: fields.SUGGESTED_FIX,
      confidence: fields.CONFIDENCE as 'low' | 'medium' | 'high' | undefined,
      raw,
    };
  }
}
