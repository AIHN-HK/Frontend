import { QuizSection, RawQuestion } from "@/types/testTypes";

export const formatQuizAnswers = (answers: Record<string, boolean>) => {
  return Object.entries(answers).map(([id, value]) => {
    return {
      questionId: id,
      check: value,
    };
  });
};

export function flattenAndNormalizeQuestions(
  rawData: RawQuestion,
): QuizSection[] {
  const result: QuizSection[] = [];

  Object.entries(rawData).forEach(([type, group]) => {
    Object.entries(group).forEach(([groupName, content]: any) => {
      result.push({
        title: groupName,
        answer: content.map((q: any) => ({
          id: String(q.id),
          content: q.content,
        })),
      });
    });
  });
  result.forEach((item, index) => {
    console.log("Title", item.title);
    console.log("Conent", item.answer);
  });

  return result;
}
