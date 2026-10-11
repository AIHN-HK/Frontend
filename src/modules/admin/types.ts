export const RIASEC_CODES = ["R", "I", "A", "S", "E", "C"] as const;
export type RiasecCode = (typeof RIASEC_CODES)[number];
export const GROUP_LABELS: Record<RiasecCode, string> = {
  R: "Kỹ thuật",
  I: "Nghiên cứu",
  A: "Nghệ thuật",
  S: "Xã hội",
  E: "Quản lý",
  C: "Nghiệp vụ",
};
export type Dimension = "PERSONA" | "ABILITY" | "INTEREST";
export const DIMENSION_LABELS: Record<Dimension, string> = {
  PERSONA: "Tôi là người",
  ABILITY: "Tôi có thể",
  INTEREST: "Tôi thích",
};
export type AdminIdentity = { id: number; fullname: string; role: "ADMIN" };
export type Question = {
  id: number;
  content: string;
  type: RiasecCode;
  dimension: Dimension | null;
  used: boolean;
  editable: boolean;
};
export type QuestionInput = {
  content: string;
  type: RiasecCode;
  dimension: Dimension;
};
export type QuestionBank = { activeAttempts: number; items: Question[] };
export type Priority = { id: number; type: RiasecCode; priority: number };
export type HollandContent = {
  code: RiasecCode;
  title: string;
  description: string | null;
  personality: string[];
  strengths: string[];
  weaknesses: string[];
  careers: string[];
};
export type HollandInput = Omit<HollandContent, "description">;
export type Student = {
  id: number;
  fullname: string;
  email: string;
  class: number | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  yob?: string;
  createdAt?: string;
};
export type TestResult = {
  topCode: string;
  scoreR: number;
  scoreI: number;
  scoreA: number;
  scoreS: number;
  scoreE: number;
  scoreC: number;
};
export type Attempt = {
  id: number;
  finishAt: string;
  totalQuestions?: number;
  result: TestResult;
  user?: { id: number; fullname: string };
};
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
export type StudentDetail = { student: Student; attempts: Page<Attempt> };
export type Overview = {
  counts: {
    students: number;
    completedTests: number;
    chatSessions: number;
    questions: number;
  };
  recentAttempts: Attempt[];
};
