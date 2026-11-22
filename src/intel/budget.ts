// Topes de costo y uso por corrida. Si se alcanza un tope, el resto se clasifica sin IA.

export interface BudgetConfig {
  maxAiCalls: number;
  maxCostUsd: number;
  /** Precio por millón de tokens del modelo configurado (consultar la página de precios antes de cambiarlo). */
  inputPerMTok: number;
  outputPerMTok: number;
  maxItemsPerSource: number;
  runTimeoutMs: number;
  requestTimeoutMs: number;
}

export const DEFAULT_BUDGET: BudgetConfig = {
  maxAiCalls: 40,
  maxCostUsd: 0.25,
  inputPerMTok: 0.1, // Claude Haiku 5.5 (prompts < 100K tokens), noviembre de 2026
  outputPerMTok: 0.5,
  maxItemsPerSource: 25,
  runTimeoutMs: 12 * 60 * 1000,
  requestTimeoutMs: 20_000,
};

export class Budget {
  aiCalls = 0;
  inputTokens = 0;
  outputTokens = 0;
  stopped = false;
  constructor(readonly cfg: BudgetConfig) {}
  get cost(): number {
    return (this.inputTokens * this.cfg.inputPerMTok + this.outputTokens * this.cfg.outputPerMTok) / 1_000_000;
  }
  canCallAi(): boolean {
    if (this.aiCalls >= this.cfg.maxAiCalls || this.cost >= this.cfg.maxCostUsd) this.stopped = true;
    return !this.stopped;
  }
  record(input: number, output: number): void {
    this.aiCalls++;
    this.inputTokens += input;
    this.outputTokens += output;
  }
  snapshot() {
    return {
      aiCalls: this.aiCalls,
      aiCallsLimit: this.cfg.maxAiCalls,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      estimatedCostUsd: Math.round(this.cost * 10000) / 10000,
      costLimitUsd: this.cfg.maxCostUsd,
      stoppedByBudget: this.stopped,
    };
  }
}
