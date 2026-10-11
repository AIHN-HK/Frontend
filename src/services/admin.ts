import axios from "axios";
import { router } from "expo-router";
import { authSession } from "@/helpers/authSession";
import { installSessionInterceptors } from "@/helpers/sessionInterceptors";
import { AppConfig } from "@/utilities/appInfo";
import type {
  AdminIdentity,
  HollandContent,
  HollandInput,
  Overview,
  Page,
  Priority,
  QuestionBank,
  QuestionInput,
  Student,
  StudentDetail,
} from "@/modules/admin/types";

// Bind requests to the account that opened the admin form; never replay writes.
const client = axios.create({
  baseURL: AppConfig.environmentDev,
  timeout: 10000,
});
installSessionInterceptors(client, authSession, {
  captureToken: true,
  refresh: async () => {
    throw new Error("Explicit login required");
  },
  onSignedOut: () => router.replace("/(authen)"),
});
const config = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});
async function get<T>(
  path: string,
  token: string,
  params?: object,
): Promise<T> {
  return (await client.get(`/api/v1/${path}`, { ...config(token), params }))
    .data.data;
}
export const adminService = {
  me: (token: string) => get<AdminIdentity>("admin/me", token),
  overview: (token: string) => get<Overview>("admin/overview", token),
  questions: (token: string) => get<QuestionBank>("admin/questions", token),
  topcodes: (token: string) => get<HollandContent[]>("admin/topcodes", token),
  priorities: (token: string) => get<Priority[]>("priority", token),
  students: (token: string, q: string, page: number) =>
    get<Page<Student>>("admin/students", token, { q, page, limit: 20 }),
  student: (token: string, id: number, page: number) =>
    get<StudentDetail>(`admin/students/${id}`, token, { page, limit: 20 }),
  async saveQuestion(token: string, input: QuestionInput, id?: number) {
    if (id) await client.patch(`/api/v1/question/${id}`, input, config(token));
    else await client.post("/api/v1/question", input, config(token));
  },
  async saveHolland(token: string, input: HollandInput) {
    await client.put("/api/v1/topcode", input, config(token));
  },
  async savePriorities(
    token: string,
    priorities: { type: string; priority: number }[],
  ) {
    await client.put("/api/v1/admin/priorities", { priorities }, config(token));
  },
};
