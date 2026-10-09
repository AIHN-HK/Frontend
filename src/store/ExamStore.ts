import quizz from "@/services/quizz";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createQuizDraftStorage } from '@/storage/quizDraftStorage';
import { authSession } from '@/helpers/authSession';
import { QuizState } from "@/types/testTypes";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  flattenAndNormalizeQuestions,
  formatQuizAnswers,
} from "../utilities/formatData";
const quizDraftStorage = createQuizDraftStorage(AsyncStorage);

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
      storage: createJSONStorage(() => quizDraftStorage),
      skipHydration: true,
      partialize: (state) => ({
        sessionId: state.sessionId,
        questions: state.questions,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
      }),
    },
  ),
);

// Suspend writes before clearing memory so logout never overwrites the saved draft.
authSession.subscribe(async (userId, reason) => {
  if (reason === 'token') return;
  quizDraftStorage.setOwner(null);
  useQuizStore.getState().reset();
  quizDraftStorage.setOwner(userId);
  if (userId !== null) await useQuizStore.persist.rehydrate();
});
