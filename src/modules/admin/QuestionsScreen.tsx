import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { adminService } from "@/services/admin";
import {
  useAdmin,
  useAdminDraft,
  useAdminResource,
  useAdminSave,
} from "./hooks";
import {
  Dimension,
  DIMENSION_LABELS,
  Question,
  QuestionInput,
  RIASEC_CODES,
  RiasecCode,
} from "./types";
import {
  AdminButton,
  AdminField,
  AdminTitle,
  CodeBadge,
  Notice,
  ResourceState,
  ui,
} from "./ui";

export default function QuestionsScreen() {
  const { token } = useAdmin();
  const resource = useAdminResource(
    useCallback(() => adminService.questions(token), [token]),
  );
  const save = useAdminSave();
  const [search, setSearch] = useState(""),
    [group, setGroup] = useState<RiasecCode | null>(null);
  const [editing, setEditing] = useAdminDraft<{
    id?: number;
    input: QuestionInput;
  } | null>("questions", null);
  const [validation, setValidation] = useState("");
  const open = (question?: Question) => {
    save.clear();
    setValidation("");
    setEditing({
      id: question?.id,
      input: {
        content: question?.content || "",
        type: question?.type || "R",
        dimension: question?.dimension || "INTEREST",
      },
    });
  };
  const change = (patch: Partial<QuestionInput>) =>
    setEditing((current) =>
      current ? { ...current, input: { ...current.input, ...patch } } : null,
    );
  const submit = async () => {
    if (!editing) return;
    const input = { ...editing.input, content: editing.input.content.trim() };
    if (!input.content || input.content.length > 2000) {
      setValidation("Nội dung cần từ 1 đến 2000 ký tự.");
      return;
    }
    setValidation("");
    if (
      await save.run(
        () => adminService.saveQuestion(token, input, editing.id),
        "Đã lưu câu hỏi.",
      )
    ) {
      setEditing(null);
      resource.reload();
    }
  };
  const items =
    resource.data?.items.filter(
      (q) =>
        (!group || q.type === group) &&
        q.content
          .toLocaleLowerCase("vi")
          .includes(search.toLocaleLowerCase("vi")),
    ) || [];
  return (
    <View style={ui.page}>
      <View style={ui.spread}>
        <AdminTitle
          title="Ngân hàng câu hỏi"
          description="Quản lý câu hỏi theo nhóm sở thích và nội dung khai thác."
        />
        <AdminButton
          title="Thêm câu hỏi"
          testID="admin-add-question"
          onPress={() => open()}
          disabled={
            !resource.data ||
            !!resource.data.activeAttempts ||
            resource.loading ||
            !!resource.error
          }
        />
      </View>
      <ResourceState {...resource} />
      {!!resource.data?.activeAttempts && (
        <Notice
          text={`Có ${resource.data.activeAttempts} bài test đang làm. Ngân hàng câu hỏi đang được khóa thay đổi.`}
        />
      )}
      <Notice text={save.message} />
      {editing && (
        <View style={ui.card}>
          <Text style={ui.heading}>
            {editing.id ? `Sửa câu hỏi #${editing.id}` : "Thêm câu hỏi mới"}
          </Text>
          <AdminField
            label="Nội dung câu hỏi"
            value={editing.input.content}
            onChange={(content) => change({ content })}
            multiline
            testID="admin-question-content"
            disabled={save.busy}
          />
          <Text style={ui.text}>Nhóm Holland</Text>
          <View style={ui.row}>
            {RIASEC_CODES.map((type) => (
              <AdminButton
                key={type}
                title={type}
                secondary={editing.input.type !== type}
                onPress={() => change({ type })}
                disabled={save.busy}
              />
            ))}
          </View>
          <Text style={ui.text}>Nội dung khai thác</Text>
          <View style={ui.row}>
            {(Object.keys(DIMENSION_LABELS) as Dimension[]).map((dimension) => (
              <AdminButton
                key={dimension}
                title={DIMENSION_LABELS[dimension]}
                secondary={editing.input.dimension !== dimension}
                onPress={() => change({ dimension })}
                disabled={save.busy}
              />
            ))}
          </View>
          <Notice text={validation || save.error} error />
          <View style={ui.row}>
            <AdminButton
              title={save.busy ? "Đang lưu..." : "Lưu câu hỏi"}
              testID="admin-question-save"
              onPress={() => void submit()}
              disabled={save.busy}
            />
            <AdminButton
              title="Hủy"
              secondary
              onPress={() => {
                setEditing(null);
                save.clear();
              }}
              disabled={save.busy}
            />
          </View>
        </View>
      )}
      {resource.data && !resource.error && (
        <View style={ui.card}>
          <AdminField
            label="Tìm kiếm câu hỏi"
            value={search}
            onChange={setSearch}
          />
          <View style={ui.row}>
            <AdminButton
              title="Tất cả"
              secondary={!!group}
              onPress={() => setGroup(null)}
            />
            {RIASEC_CODES.map((code) => (
              <AdminButton
                key={code}
                title={code}
                secondary={group !== code}
                onPress={() => setGroup(code)}
              />
            ))}
          </View>
          <Text style={ui.subtitle}>
            {items.length} câu hỏi · Câu đã được sử dụng được giữ nguyên để bảo
            toàn bài làm.
          </Text>
          {!items.length && (
            <Text style={ui.subtitle}>Không tìm thấy câu hỏi phù hợp.</Text>
          )}
          {items.map((question) => (
            <View key={question.id} style={ui.item}>
              <View style={ui.spread}>
                <View style={ui.row}>
                  <CodeBadge code={question.type} />
                  <Text style={ui.subtitle}>
                    #{question.id} ·{" "}
                    {question.dimension
                      ? DIMENSION_LABELS[question.dimension]
                      : "Chưa phân loại"}
                  </Text>
                </View>
                {question.editable ? (
                  <AdminButton
                    title="Chỉnh sửa"
                    secondary
                    testID={`admin-question-edit-${question.id}`}
                    onPress={() => open(question)}
                    disabled={save.busy}
                  />
                ) : (
                  <Text style={ui.subtitle}>
                    {question.used
                      ? "Đã sử dụng · Chỉ xem"
                      : "Bộ đề đang được sử dụng"}
                  </Text>
                )}
              </View>
              <Text style={ui.text}>{question.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
