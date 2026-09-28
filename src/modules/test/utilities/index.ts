
export const getTopCodeLabel = (topCode: string) => {
  const codeMap: Record<string, string> = {
    R: "Kỹ sư",
    I: "Nhà khoa học",
    A: "Nghệ thuật",
    S: "Xã hội",
    E: "Lãnh đạo",
    C: "Hành chính",
  };
  const codes = topCode.split("");
  return codes.map((c) => codeMap[c] || c).join(" - ");
};
export type RIASECScore = {
  R?: number;
  I?: number;
  A?: number;
  S?: number;
  E?: number;
  C?: number;
  [key: string]: number | undefined;
};

export type ResultItem = {
  title: string;
  description: string | string[];
  date: string;
  personality: string | string[];
  careers: string;
  strengths: string;
  weaknesses: string;
  code: string;
};
export const scoreOrder = ["R", "I", "A", "S", "E", "C"];
