import quizz from "@/services/quizz";
import { asyncStorageAdapter } from "@/storage/asyncStorageAdapter";
import { QuizState } from "@/types/testTypes";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  flattenAndNormalizeQuestions,
  formatQuizAnswers,
} from "../utilities/formatData";

export const useQuizStore = create<QuizState>()(
  persist(
    immer((set, get) => ({
      sessionId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      isSubmitting: false,

      setQuestions: (rawData: any) => {
        const formatted = flattenAndNormalizeQuestions(rawData);
        const initialAnswers: Record<string, boolean> = {};
        formatted.forEach((section) => {
          section.answer.forEach((item) => {
            initialAnswers[item.id] = false;
          });
        });
        set({
          questions: formatted,
          currentQuestionIndex: 0,
          answers: initialAnswers,
        });
      },
      setSession: (sessionId: string) => {
        set({
          sessionId,
          currentQuestionIndex: 0,
          answers: {},
        });
      },

      toggleAnswer: (answerId: string) => {
        set((state) => {
          state.answers[answerId] = !state.answers[answerId];
        });
      },

      nextQuestion: () => {
        set((state) => {
          if (state.currentQuestionIndex < state.questions.length - 1) {
            state.currentQuestionIndex += 1;
          }
        });
      },

      prevQuestion: () => {
        set((state) => {
          if (state.currentQuestionIndex > 0) {
            state.currentQuestionIndex -= 1;
          }
        });
      },

      submitSession: async () => {
        const { sessionId, answers } = get();
        // const formattedAnswers = Object.entries(answers).map(([id, value]) => ({
        //   questionId: id,
        //   check: value,
        // }));
        const formattedAnswers = formatQuizAnswers(answers);
        const payload = {
          attemptId: Number(sessionId),
          answers: formattedAnswers,
        };
        const resultId = await quizz.submitSessionId(payload);
        
        set({
          sessionId: null,
          questions: [],
          currentQuestionIndex: 0,
          answers: {},
        });

        return {
          success: true,
          id: resultId.attemptId,
          score: resultId.score,
        };
      },

      reset: () => {
        set({
          sessionId: null,
          questions: [],
          currentQuestionIndex: 0,
          answers: {},
        });
      },
    })),
    {
      name: "huong-nghiep-quiz",
      storage: createJSONStorage(() => asyncStorageAdapter),
      partialize: (state) => ({
        sessionId: state.sessionId,
        questions: state.questions,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
      }),
    },
  ),
);
