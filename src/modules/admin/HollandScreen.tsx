import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { adminService } from "@/services/admin";
import {
  useAdmin,
  useAdminDraft,
  useAdminResource,
  useAdminSave,
} from "./hooks";
import { GROUP_LABELS, HollandContent, HollandInput } from "./types";
import {
  AdminButton,
  AdminField,
  AdminTitle,
  CodeBadge,
  Notice,
  ResourceState,
  ui,
} from "./ui";

const arrayFields = [
  { key: "personality", label: "Đặc điểm tính cách" },
  { key: "strengths", label: "Điểm mạnh" },
  { key: "weaknesses", label: "Điểm cần cải thiện" },
  { key: "careers", label: "Nghề nghiệp phù hợp" },
] as const;
type Draft = {
  code: HollandContent["code"];
  title: string;
  personality: string;
  strengths: string;
  weaknesses: string;
  careers: string;
};
export default function HollandScreen() {
  const { token } = useAdmin();
  const resource = useAdminResource(
    useCallback(() => adminService.topcodes(token), [token]),
  );
  const save = useAdminSave();
  const [draft, setDraft] = useAdminDraft<Draft | null>("holland", null),
    [validation, setValidation] = useState("");
  const open = (content: HollandContent) => {
    save.clear();
    setValidation("");
    setDraft({
      code: content.code,
      title: content.title,
      personality: content.personality.join("\n"),
      strengths: content.strengths.join("\n"),
      weaknesses: content.weaknesses.join("\n"),
      careers: content.careers.join("\n"),
    });
  };
  const submit = async () => {
    if (!draft) return;
    const input: HollandInput = {
      code: draft.code,
      title: draft.title.trim(),
      personality: [],
      strengths: [],
      weaknesses: [],
      careers: [],
    };
    for (const { key } of arrayFields)
      input[key] = draft[key]
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    if (!input.title || arrayFields.some(({ key }) => !input[key].length)) {
      setValidation("Nhập tiêu đề và ít nhất một mục cho mỗi nội dung.");
      return;
    }
    setValidation("");
    if (
      await save.run(
        () => adminService.saveHolland(token, input),
        "Đã lưu nội dung Holland.",
      )
    ) {
      setDraft(null);
      resource.reload();
    }
  };
  return (
    <View style={ui.page}>
      <AdminTitle
        title="Nội dung Holland"
        description="Diễn giải 6 nhóm sở thích dùng trong kết quả hướng nghiệp."
      />
      <ResourceState {...resource} />
      <Notice text={save.message} />
      {draft && (
        <View style={ui.card}>
          <View style={ui.row}>
            <CodeBadge code={draft.code} />
            <Text style={ui.heading}>{GROUP_LABELS[draft.code]}</Text>
          </View>
          <AdminField
            label="Tiêu đề nhóm"
            value={draft.title}
            onChange={(title) => setDraft({ ...draft, title })}
            testID="admin-holland-title"
            disabled={save.busy}
          />
          <Text style={ui.subtitle}>
            Mỗi dòng là một mục. Nội dung cập nhật được dùng cho phần diễn giải
            hiện hành.
          </Text>
          {arrayFields.map(({ key, label }) => (
            <AdminField
              key={key}
              label={label}
              value={draft[key]}
              onChange={(value) => setDraft({ ...draft, [key]: value })}
              multiline
              disabled={save.busy}
            />
          ))}
          <Notice text={validation || save.error} error />
          <View style={ui.row}>
            <AdminButton
              title={save.busy ? "Đang lưu..." : "Lưu nội dung"}
              testID="admin-holland-save"
              onPress={() => void submit()}
              disabled={save.busy}
            />
            <AdminButton
              title="Hủy"
              secondary
              onPress={() => {
                setDraft(null);
                save.clear();
              }}
              disabled={save.busy}
            />
          </View>
        </View>
      )}
      {resource.data && !resource.error && (
        <View style={[ui.row, { alignItems: "stretch" }]}>
          {resource.data.map((content) => (
            <View
              key={content.code}
              style={[ui.card, { flexGrow: 1, flexBasis: 280 }]}
            >
              <View style={ui.row}>
                <CodeBadge code={content.code} />
                <Text style={ui.heading}>{GROUP_LABELS[content.code]}</Text>
              </View>
              <Text style={ui.text}>{content.title}</Text>
              <Text style={ui.subtitle}>{content.personality.join(" · ")}</Text>
              <AdminButton
                title="Chỉnh sửa nội dung"
                secondary
                testID={`admin-holland-${content.code}`}
                onPress={() => open(content)}
                disabled={save.busy}
              />
            </View>
          ))}
          {!resource.data.length && (
            <Text style={ui.subtitle}>Chưa có dữ liệu diễn giải Holland.</Text>
          )}
        </View>
      )}
    </View>
  );
}
