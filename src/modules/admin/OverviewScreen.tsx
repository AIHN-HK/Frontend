import React, { useCallback } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { adminService } from "@/services/admin";
import { COLORS, renderColoryCode } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { useAdmin, useAdminResource } from "./hooks";
import {
  AdminButton,
  AdminTitle,
  CodeBadge,
  formatDate,
  ResourceState,
  ui,
} from "./ui";

export default function OverviewScreen() {
  const { token } = useAdmin();
  const resource = useAdminResource(
    useCallback(() => adminService.overview(token), [token]),
  );
  const cards = [
    {
      label: "Học sinh",
      value: resource.data?.counts.students,
      color: COLORS.purple2,
      icon: "users",
    },
    {
      label: "Bài test hoàn thành",
      value: resource.data?.counts.completedTests,
      color: COLORS.green2,
      icon: "check-circle",
    },
    {
      label: "Phiên tư vấn",
      value: resource.data?.counts.chatSessions,
      color: COLORS.yellow2,
      icon: "message-circle",
    },
    {
      label: "Câu hỏi Holland",
      value: resource.data?.counts.questions,
      color: COLORS.red2,
      icon: "help-circle",
    },
  ] as const;
  return (
    <View testID="admin-overview" style={ui.page}>
      <View style={ui.spread}>
        <AdminTitle
          title="Tổng quan hệ thống"
          description="Theo dõi hoạt động tư vấn và quản lý nội dung hướng nghiệp."
        />
        <AdminButton
          title="Làm mới"
          secondary
          onPress={resource.reload}
          disabled={resource.loading}
        />
      </View>
      <ResourceState {...resource} />
      {resource.data && !resource.error && (
        <>
          <View style={[ui.row, { alignItems: "stretch" }]}>
            {cards.map((card) => (
              <View
                key={card.label}
                style={{
                  flexGrow: 1,
                  flexBasis: 210,
                  padding: 24,
                  borderRadius: 24,
                  backgroundColor: card.color,
                  gap: 16,
                }}
              >
                <View style={ui.spread}>
                  <Text style={ui.text}>{card.label}</Text>
                  <Feather name={card.icon} size={22} color={COLORS.black} />
                </View>
                <Text style={{ ...TYPOGRAPHY.H3, color: COLORS.blackText }}>
                  {card.value?.toLocaleString("vi-VN")}
                </Text>
              </View>
            ))}
          </View>
          <View style={ui.card}>
            <View style={ui.spread}>
              <Text style={ui.heading}>Bài test hoàn thành gần đây</Text>
              <Text style={ui.subtitle}>5 bài mới nhất</Text>
            </View>
            {!resource.data.recentAttempts.length && (
              <Text style={ui.subtitle}>Chưa có bài test hoàn thành.</Text>
            )}
            {resource.data.recentAttempts.map((attempt) => (
              <View key={attempt.id} style={[ui.item, ui.spread]}>
                <View style={{ gap: 4 }}>
                  <Text style={ui.text}>
                    {attempt.user?.fullname || "Học sinh"}
                  </Text>
                  <Text style={ui.subtitle}>
                    Bài #{attempt.id} · {formatDate(attempt.finishAt)}
                  </Text>
                </View>
                <View style={ui.row}>
                  <CodeBadge code={attempt.result.topCode} />
                  {attempt.user && (
                    <AdminButton
                      title="Xem học sinh"
                      secondary
                      onPress={() =>
                        router.push(`/admin/students/${attempt.user!.id}`)
                      }
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
          <View style={ui.card}>
            <Text style={ui.heading}>6 nhóm sở thích Holland</Text>
            <Text style={ui.subtitle}>
              Một hệ thống nội dung thống nhất từ bài test đến tư vấn.
            </Text>
            <View style={ui.row}>
              {["R", "I", "A", "S", "E", "C"].map((code) => (
                <View
                  key={code}
                  style={{
                    height: 48,
                    width: 48,
                    borderRadius: 16,
                    backgroundColor: renderColoryCode(code),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ ...TYPOGRAPHY.B2, color: COLORS.blackText }}>
                    {code}
                  </Text>
                </View>
              ))}
            </View>
            <AdminButton
              title="Quản lý nội dung Holland"
              secondary
              onPress={() => router.push("/admin/holland")}
            />
          </View>
        </>
      )}
    </View>
  );
}
