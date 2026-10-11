import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { adminService } from "@/services/admin";
import { useAdmin, useAdminResource } from "./hooks";
import {
  AdminButton,
  AdminField,
  AdminTitle,
  CodeBadge,
  formatDate,
  Pagination,
  ResourceState,
  ui,
} from "./ui";
import { RIASEC_CODES } from "./types";

export default function StudentsScreen() {
  const { token } = useAdmin();
  const [input, setInput] = useState(""),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1);
  const resource = useAdminResource(
    useCallback(
      () => adminService.students(token, query, page),
      [token, query, page],
    ),
  );
  return (
    <View style={ui.page}>
      <AdminTitle
        title="Học sinh"
        description="Tra cứu hồ sơ cơ bản và kết quả bài test đã hoàn thành."
      />
      <View style={ui.card}>
        <AdminField
          label="Tìm theo họ tên hoặc email"
          value={input}
          onChange={setInput}
          testID="admin-student-search"
        />
        <AdminButton
          title="Tìm kiếm"
          testID="admin-student-search-submit"
          onPress={() => {
            setPage(1);
            setQuery(input.trim());
            resource.reload();
          }}
          disabled={resource.loading}
        />
        <ResourceState {...resource} />
        {resource.data && !resource.loading && !resource.error && (
          <>
            {!resource.data.items.length && (
              <Text style={ui.subtitle}>Không tìm thấy học sinh phù hợp.</Text>
            )}
            {resource.data.items.map((student) => (
              <View key={student.id} style={[ui.item, ui.spread]}>
                <View style={{ flex: 1, minWidth: 160, gap: 4 }}>
                  <Text style={ui.text}>{student.fullname}</Text>
                  <Text style={ui.subtitle}>{student.email}</Text>
                  <Text style={ui.subtitle}>Khối {student.class || "—"}</Text>
                </View>
                <AdminButton
                  title="Xem hồ sơ"
                  secondary
                  testID={`admin-student-${student.id}`}
                  onPress={() => router.push(`/admin/students/${student.id}`)}
                />
              </View>
            ))}
            <Pagination {...resource.data} onChange={setPage} />
          </>
        )}
      </View>
    </View>
  );
}

export function StudentDetailScreen() {
  const { token } = useAdmin();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id),
    [page, setPage] = useState(1);
  const resource = useAdminResource(
    useCallback(() => {
      if (!Number.isSafeInteger(id) || id <= 0)
        return Promise.reject(new Error("Invalid student"));
      return adminService.student(token, id, page);
    }, [token, id, page]),
  );
  return (
    <View testID="admin-student-detail" style={ui.page}>
      <View style={ui.spread}>
        <AdminTitle
          title="Hồ sơ học sinh"
          description="Thông tin cơ bản và kết quả đã được hệ thống lưu."
        />
        <AdminButton
          title="Về danh sách"
          secondary
          onPress={() => router.push("/admin/students")}
        />
      </View>
      <ResourceState {...resource} />
      {resource.data && !resource.loading && !resource.error && (
        <>
          <View style={ui.card}>
            <Text style={ui.heading}>{resource.data.student.fullname}</Text>
            <Text style={ui.text}>{resource.data.student.email}</Text>
            <View style={ui.row}>
              <Text style={ui.subtitle}>
                Khối {resource.data.student.class || "—"}
              </Text>
              <Text style={ui.subtitle}>
                Điện thoại: {resource.data.student.phone || "—"}
              </Text>
            </View>
            <Text style={ui.subtitle}>
              Địa chỉ: {resource.data.student.address || "—"}
            </Text>
          </View>
          <View style={ui.card}>
            <Text style={ui.heading}>Bài test đã hoàn thành</Text>
            {!resource.data.attempts.items.length && (
              <Text style={ui.subtitle}>
                Học sinh chưa có bài test hoàn thành.
              </Text>
            )}
            {resource.data.attempts.items.map((attempt) => (
              <View key={attempt.id} style={ui.item}>
                <View style={ui.spread}>
                  <Text style={ui.text}>
                    Bài #{attempt.id} · {formatDate(attempt.finishAt)}
                  </Text>
                  <CodeBadge code={attempt.result.topCode} />
                </View>
                <View style={ui.row}>
                  {RIASEC_CODES.map((code) => (
                    <Text key={code} style={ui.subtitle}>
                      {code}: {attempt.result[`score${code}`]}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
            <Pagination {...resource.data.attempts} onChange={setPage} />
          </View>
        </>
      )}
    </View>
  );
}
