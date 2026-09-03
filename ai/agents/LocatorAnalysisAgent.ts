import path from 'node:path';
import { createAIClient, type AIClient } from '../AIClient';
import { renderPrompt } from '../PromptTemplate';
import { parseFields } from '../ResponseParser';

const PROMPT_PATH = path.join(__dirname, '../prompts/locator-analysis.prompt.md');

export interface LocatorAnalysisRequest {
  /** Accessibility snapshot excerpt, relevant HTML, or a plain description of the element. */
  elementDescription: string;
  pageUrl?: string;
}

export interface LocatorAnalysisResult {
  /** Absent if the model didn't reply in the expected format — never fabricated. */
  recommendedLocator?: string;
  rationale?: string;
  /** The full, unparsed model response, so nothing is lost if parsing misses something. */
  raw: string;
}

/**
 * Recommends a stable Playwright locator for a described element,
 * preferring getByRole/getByLabel/getByPlaceholder/getByText/getByTestId
 * over CSS or XPath — see ai/prompts/locator-analysis.prompt.md for the
 * exact priority order given to the model. It never edits a Page Object
 * file itself; a human applies the recommendation.
 */
export class LocatorAnalysisAgent {
  constructor(private readonly client: AIClient = createAIClient()) {}

  async analyze(request: LocatorAnalysisRequest): Promise<LocatorAnalysisResult> {
    const prompt = renderPrompt(PROMPT_PATH, {
      pageUrl: request.pageUrl ?? '(not provided)',
      elementDescription: request.elementDescription,
    });

    const raw = await this.client.complete(prompt);
    const fields = parseFields(raw, ['RECOMMENDED_LOCATOR', 'RATIONALE']);

    return { recommendedLocator: fields.RECOMMENDED_LOCATOR, rationale: fields.RATIONALE, raw };
  }
}
