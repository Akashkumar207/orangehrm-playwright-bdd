import path from 'node:path';
import { createAIClient, type AIClient } from '../AIClient';
import { renderPrompt } from '../PromptTemplate';
import { parseFields } from '../ResponseParser';

const PROMPT_PATH = path.join(__dirname, '../prompts/maintenance.prompt.md');

export interface MaintenanceCheckRequest {
  pageObjectName: string;
  locatorName: string;
  previousLocator: string;
  /** Accessibility tree excerpt or relevant HTML from the page as it looks today. */
  currentPageSnapshot: string;
}

export interface MaintenanceRecommendation {
  changeDetected?: boolean;
  recommendation?: string;
  raw: string;
}

/**
 * Detects whether a Page Object's locator has likely drifted from the real
 * UI (renamed button, restructured form, moved element) and recommends a
 * replacement. It never edits the Page Object file — the workflow is
 * always: recommendation → human review → code change → pull request → CI,
 * never an automatic edit to production test code.
 */
export class TestMaintenanceAgent {
  constructor(private readonly client: AIClient = createAIClient()) {}

  async check(request: MaintenanceCheckRequest): Promise<MaintenanceRecommendation> {
    const prompt = renderPrompt(PROMPT_PATH, {
      pageObjectName: request.pageObjectName,
      locatorName: request.locatorName,
      previousLocator: request.previousLocator,
      currentPageSnapshot: request.currentPageSnapshot,
    });

    const raw = await this.client.complete(prompt);
    const fields = parseFields(raw, ['CHANGE_DETECTED', 'RECOMMENDATION']);

    return {
      changeDetected: fields.CHANGE_DETECTED ? fields.CHANGE_DETECTED.toLowerCase() === 'yes' : undefined,
      recommendation: fields.RECOMMENDATION,
      raw,
    };
  }
}
