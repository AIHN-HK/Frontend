import { axiosBear } from "@/helpers/axiosInterceptors";
import { QuizzAPI } from "./api";

export default {
  async getAllquiz() {
    try {
      const response = await axiosBear.get(QuizzAPI.GET_ALL_QUIZ);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getStartSessionStatus() {
    try {
      const response = await axiosBear.post(QuizzAPI.START_SESSION);
      const data = response.data;
      console.log("SessionStatus: ", data);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async submitSessionId(payload: any) {
    try {
      const resposnse = await axiosBear.post(QuizzAPI.SUBMIT_SESSION, payload);
      const result = await resposnse.data;
      console.log("SubmitSeesion", result);
      if (result !== null) {
        console.log("Here");
        return result.data;
      } else {
        console.log("Error submit");
      }
    } catch (error) {
      throw error;
    }
  },

  async getQuizresult(attemptId: number) {
    try {
      console.log("AttemptID", attemptId);
      const response = await axiosBear.get(
        `${QuizzAPI.GET_QUIZ_RESULT}/${attemptId}`,
      );
      const result = response.data.data;
      console.log("Datadasdas", result);
      if (result !== null) {
        return result;
      } else {
        console.log("Error submit");
      }
    } catch (error) {
      throw error;
    }
  },
  async getHistoryQuiz(
    limit?: number,
    cursorCreatedAt?: string,
    cursorId?: string,
  ) {
    try {
      const params: Record<string, string | number | undefined> = {};

      if (limit !== undefined) {
        params.limit = typeof limit === "number" ? limit : Number(limit);
      }
      if (cursorCreatedAt !== undefined) {
        params.cursorCreatedAt = cursorCreatedAt;
      }
      if (cursorId !== undefined) {
        params.cursorId = cursorId;
      }

      const response = await axiosBear.get(QuizzAPI.Get_HISTORY_QUIZ, {
        params,
      });
      const result = response.data.data;
      console.log("Get history", result);
      if (result !== null) {
        return result;
      } else {
        console.log("Error");
      }
    } catch (error) {
      throw error;
    }
  },
};
