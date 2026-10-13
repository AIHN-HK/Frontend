export type HistoryResult = {
  attemptId: number;
  finishAt: string;
  analyzeType: 'NORMAL' | 'ALL_HIGH' | 'ALL_LOW' | 'OPPOSITE';
  primaryAnalyze: { code: string; title: string; description: string | null } | null;
};

export const riasecCodes = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecCode = typeof riasecCodes[number];
export type AssessmentQuestion = { id: number; content: string; type: RiasecCode; dimension: 'PERSONA' | 'ABILITY' | 'INTEREST' | null };
export type AssessmentScope = { ownerId: number; revision: number };
export type AssessmentAttempt = { id: number; userId: number; totalQuestions: number };
export type AssessmentScores = Record<RiasecCode, number>;
export type AssessmentConfirmation = { attemptId: number; scores: AssessmentScores; topCode: string };
export type AssessmentDraft = {
  version: 1;
  scale: 'boolean';
  ownerId: number;
  attemptId: number;
  totalQuestions: number;
  questions: AssessmentQuestion[];
  answers: Record<string, boolean>;
  index: number;
  needsReview: boolean;
};

export type AssessmentResult = {
  attemptId: number;
  scores: AssessmentScores;
  topCode: string;
  ranked: { type: RiasecCode; score: number; rank: number }[];
};
export type AssessmentPercentages = Record<RiasecCode, number | null>;
export type AssessmentNormalization = { counts: AssessmentScores; percentages: AssessmentPercentages; totalQuestions: number };
export type AssessmentAnalysisItem = {
  code: string;
  title: string;
  description: string | null;
  personality: string[];
  strengths: string[];
  weaknesses: string[];
  careers: string[];
};
export type AssessmentAnalysis = { finishAt: string; items: AssessmentAnalysisItem[] };
