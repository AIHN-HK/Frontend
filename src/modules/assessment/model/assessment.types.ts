export type HistoryResult = {
  attemptId: number;
  finishAt: string;
  analyzeType: 'NORMAL' | 'ALL_HIGH' | 'ALL_LOW' | 'OPPOSITE';
  primaryAnalyze: { code: string; title: string; description: string | null } | null;
};
