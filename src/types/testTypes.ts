export interface RawQuizQuestion {
  id: number;
  content: string;
  type: string;
  dimension: string;
  createdAt: string;
}
export interface RawQuestion {
  [type: string]: {
    [group: string]: RawQuizQuestion[];
  };
}
export type QuizSection = {
  title: string;
  answer: AnswerQuestion[];
};

export interface AnswerQuestion {
  id: string;
  content: string;
}
export interface QuizState {
  sessionId: string | null;
  questions: QuizSection[];
  currentQuestionIndex: number;
  answers: Record<string, boolean>;
  setQuestions: (rawData: any) => void;
  setSession: (sessionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitSession: () => Promise<{ success: boolean; id?: number; score?: any }>;
  toggleAnswer: (answerId: string) => void;
  reset: () => void;
}
