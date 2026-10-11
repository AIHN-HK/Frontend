import { authSession } from "@/helpers/authSession";
import { adminService } from "@/services/admin";
import auth from "@/services/auth";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { TYPOGRAPHY } from "@/utilities/typography";
import { Feather } from "@expo/vector-icons";
import { Href, router, Slot, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminContext, adminError } from "./hooks";
import { AdminIdentity } from "./types";
import { AdminButton, Notice, ui } from "./ui";
import { isAxiosError } from "axios";

const navigation = [
  { key: "overview", path: "/admin", label: "Tổng quan", icon: "grid" },
  {
    key: "questions",
    path: "/admin/questions",
    label: "Ngân hàng câu hỏi",
    icon: "help-circle",
  },
  {
    key: "holland",
    path: "/admin/holland",
    label: "Nội dung Holland",
    icon: "book-open",
  },
  {
    key: "priorities",
    path: "/admin/priorities",
    label: "Cấu hình chấm điểm",
    icon: "sliders",
  },
  {
    key: "students",
    path: "/admin/students",
    label: "Học sinh",
    icon: "users",
  },
] as const;

export default function AdminLayout() {
  const desktop = useIsDesktopWeb(),
    pathname = usePathname();
  const [account, setAccount] = useState<{
    identity: AdminIdentity;
    token: string;
  } | null>(null);
  const [state, setState] = useState<
    "loading" | "allowed" | "forbidden" | "error"
  >("loading");
  const [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true,
      generation = 0;
    const verify = async () => {
      const current = ++generation;
      setAccount(null);
      setState("loading");
      try {
        const session = await authSession.read();
        if (!active || current !== generation) return;
        if (!session.accessToken) {
          router.replace("/(authen)");
          return;
        }
        const identity = await adminService.me(session.accessToken);
        if (!active || current !== generation) return;
        if (identity.role !== "ADMIN") {
          setState("forbidden");
          return;
        }
        setAccount({ identity, token: session.accessToken });
        setState("allowed");
      } catch (err) {
        if (!active || current !== generation) return;
        if (isAxiosError(err) && err.response?.status === 403)
          setState("forbidden");
        else {
          setError(adminError(err));
          setState("error");
        }
      }
    };
    const unsubscribe = authSession.subscribe(() => {
      void verify();
    });
    void verify();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [revision]);
  if (state !== "allowed" || !account)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        {state === "loading" ? (
          <ActivityIndicator color={COLORS.black} />
        ) : (
          <View
            testID={state === "forbidden" ? "admin-forbidden" : "admin-error"}
            style={[ui.card, { maxWidth: 520, width: "100%" }]}
          >
            <Text style={ui.heading}>
              {state === "forbidden"
                ? "Bạn không có quyền quản trị"
                : "Chưa thể mở dashboard"}
            </Text>
            <Notice
              text={
                state === "forbidden"
                  ? "Trang này dành cho quản trị viên của hệ thống."
                  : error
              }
              error
            />
            <AdminButton
              title={state === "forbidden" ? "Về trang học sinh" : "Thử lại"}
              onPress={() =>
                state === "forbidden"
                  ? router.replace("/(tabs)/home")
                  : setRevision((v) => v + 1)
              }
            />
          </View>
        )}
      </SafeAreaView>
    );
  const menu = navigation.map((item) => {
    const selected =
      item.path === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.path);
    return (
      <Pressable
        key={item.key}
        testID={`admin-nav-${item.key}`}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected }}
        onPress={() => router.push(item.path as Href)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          padding: 14,
          borderRadius: 16,
          backgroundColor: selected ? COLORS.green2 : COLORS.white,
          flexShrink: 0,
        }}
      >
        <Feather name={item.icon} size={18} color={COLORS.black} />
        <Text style={{ ...TYPOGRAPHY.B4, color: COLORS.blackText }}>
          {item.label}
        </Text>
      </Pressable>
    );
  });
  return (
    <AdminContext.Provider
      key={`${account.identity.id}:${account.token}`}
      value={account}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View
          style={{
            flex: 1,
            flexDirection: desktop ? "row" : "column",
            minWidth: 0,
          }}
        >
          <View
            style={{
              width: desktop ? 248 : "100%",
              borderRightWidth: desktop ? 1 : 0,
              borderBottomWidth: desktop ? 0 : 1,
              borderColor: COLORS.innershadow,
              padding: desktop ? 24 : 16,
              gap: 24,
            }}
          >
            <View style={{ gap: 4 }}>
              <Text style={{ ...TYPOGRAPHY.H4, color: COLORS.blackText }}>
                Hướng nghiệp<Text style={{ color: COLORS.colortext2 }}>.</Text>
              </Text>
              <Text style={ui.subtitle}>Không gian quản trị</Text>
            </View>
            {desktop ? (
              <View style={{ gap: 8 }}>{menu}</View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
              >
                {menu}
              </ScrollView>
            )}
            {desktop && (
              <View style={{ marginTop: "auto", gap: 12 }}>
                <Text style={ui.subtitle}>
                  Quản lý nội dung, đồng hành cùng học sinh.
                </Text>
                <AdminButton
                  title="Về trang học sinh"
                  secondary
                  onPress={() => router.push("/(tabs)/home")}
                />
              </View>
            )}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                paddingHorizontal: desktop ? 32 : 20,
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderColor: COLORS.innershadow,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={ui.row}>
                <View
                  style={{
                    height: 36,
                    width: 36,
                    borderRadius: 18,
                    backgroundColor: COLORS.purple2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="shield" size={17} color={COLORS.black} />
                </View>
                <Text style={ui.text}>{account.identity.fullname}</Text>
              </View>
              <AdminButton
                title="Đăng xuất"
                secondary
                onPress={() => {
                  void auth
                    .logout()
                    .catch(() => undefined)
                    .finally(() => router.replace("/(authen)"));
                }}
              />
            </View>
            <ScrollView
              contentContainerStyle={{
                padding: desktop ? 32 : 20,
                paddingBottom: 48,
                width: "100%",
                maxWidth: 1280,
                alignSelf: "center",
              }}
            >
              <Slot />
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </AdminContext.Provider>
  );
}
