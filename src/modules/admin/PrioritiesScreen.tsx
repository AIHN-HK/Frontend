import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { adminService } from "@/services/admin";
import {
  useAdmin,
  useAdminDraft,
  useAdminResource,
  useAdminSave,
} from "./hooks";
import { GROUP_LABELS, Priority } from "./types";
import {
  AdminButton,
  AdminTitle,
  CodeBadge,
  Notice,
  ResourceState,
  ui,
} from "./ui";

export default function PrioritiesScreen() {
  const { token } = useAdmin();
  const resource = useAdminResource(
    useCallback(() => adminService.priorities(token), [token]),
  );
  const save = useAdminSave();
  const [pendingOrder, setOrder] = useAdminDraft<Priority[] | null>(
    "priorities",
    null,
  );
  const [savedOrder, setSavedOrder] = useState<Priority[]>([]);
  const order = pendingOrder || savedOrder;
  useEffect(() => {
    if (resource.data) {
      const sorted = [...resource.data].sort((a, b) => a.priority - b.priority);
      setSavedOrder(sorted);
    }
  }, [resource.data]);
  const valid =
    order.length === 6 && new Set(order.map((p) => p.type)).size === 6;
  const move = (index: number, delta: number) => {
    save.clear();
    setOrder(() => {
      const next = [...order];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  };
  return (
    <View style={ui.page}>
      <AdminTitle
        title="Cấu hình chấm điểm"
        description="Thứ tự ưu tiên dùng khi hai nhóm Holland có cùng điểm."
      />
      <ResourceState {...resource} />
      <Notice text="Nhóm ở trên được ưu tiên trước khi điểm bằng nhau. Thay đổi áp dụng cho lần chấm tiếp theo; kết quả đã lưu được giữ nguyên." />
      <Notice text={save.error} error />
      <Notice text={save.message} />
      {resource.data && !resource.error && (
        <View style={ui.card}>
          <Text style={ui.heading}>Thứ tự 6 nhóm Holland</Text>
          {!valid && (
            <Notice
              text="Bảng độ ưu tiên cần đủ 6 nhóm hợp lệ trước khi lưu."
              error
            />
          )}
          {order.map((row, index) => (
            <View key={row.id} style={[ui.item, ui.spread]}>
              <View style={ui.row}>
                <Text style={ui.subtitle}>{index + 1}.</Text>
                <CodeBadge code={row.type} />
                <Text style={ui.text}>{GROUP_LABELS[row.type]}</Text>
              </View>
              <View style={ui.row}>
                <AdminButton
                  title="Lên"
                  secondary
                  testID={`admin-priority-up-${row.type}`}
                  onPress={() => move(index, -1)}
                  disabled={index === 0 || save.busy}
                />
                <AdminButton
                  title="Xuống"
                  secondary
                  onPress={() => move(index, 1)}
                  disabled={index === order.length - 1 || save.busy}
                />
              </View>
            </View>
          ))}
          <View style={ui.row}>
            <AdminButton
              title={save.busy ? "Đang lưu..." : "Lưu thứ tự ưu tiên"}
              testID="admin-priorities-save"
              disabled={!valid || save.busy || resource.loading}
              onPress={() => {
                const next = order.map((p, index) => ({
                  ...p,
                  priority: index + 1,
                }));
                void save
                  .run(
                    () =>
                      adminService.savePriorities(
                        token,
                        next.map(({ type, priority }) => ({ type, priority })),
                      ),
                    "Đã lưu thứ tự ưu tiên.",
                  )
                  .then((saved) => {
                    if (saved) {
                      setSavedOrder(next);
                      setOrder(null);
                    }
                  });
              }}
            />
            <AdminButton
              title="Khôi phục thứ tự đã tải"
              secondary
              disabled={save.busy}
              onPress={() => {
                setOrder(null);
                save.clear();
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
