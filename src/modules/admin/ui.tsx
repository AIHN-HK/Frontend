import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS, renderColoryCode } from "@/utilities/colors";
import { FONT_FAMILY, TYPOGRAPHY } from "@/utilities/typography";

export const ui = StyleSheet.create({
  page: { gap: 24, width: "100%" },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  spread: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.innershadow,
    backgroundColor: COLORS.white,
    gap: 16,
  },
  title: { ...TYPOGRAPHY.H4, color: COLORS.blackText },
  subtitle: { ...TYPOGRAPHY.B3, color: COLORS.colortext2 },
  text: { ...TYPOGRAPHY.B3, color: COLORS.colortext1 },
  heading: { ...TYPOGRAPHY.H5, color: COLORS.blackText },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.innershadow,
    gap: 10,
  },
  input: {
    ...TYPOGRAPHY.B1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.basegrey4,
    padding: 14,
    backgroundColor: COLORS.white,
    color: COLORS.blackText,
    minWidth: 0,
  },
});
export function AdminTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={ui.title}>{title}</Text>
      <Text style={ui.subtitle}>{description}</Text>
    </View>
  );
}
export function AdminButton({
  title,
  onPress,
  disabled = false,
  secondary = false,
  testID,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: secondary ? COLORS.basegrey4 : COLORS.green1,
        backgroundColor: secondary ? COLORS.white : COLORS.green1,
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        alignSelf: "flex-start",
      })}
    >
      <Text style={{ ...TYPOGRAPHY.B4, color: COLORS.blackText }}>{title}</Text>
    </Pressable>
  );
}
export function AdminField({
  label,
  value,
  onChange,
  multiline = false,
  testID,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  testID?: string;
  disabled?: boolean;
}) {
  return (
    <View style={{ gap: 8, width: "100%" }}>
      <Text style={{ ...TYPOGRAPHY.B4, color: COLORS.blackText }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        testID={testID}
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[
          ui.input,
          multiline && { minHeight: 112, textAlignVertical: "top" },
        ]}
        placeholderTextColor={COLORS.colortext2}
      />
    </View>
  );
}
export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  if (!text) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: error ? COLORS.red2 : COLORS.green2,
      }}
    >
      <Text style={{ ...TYPOGRAPHY.B3, color: COLORS.blackText }}>{text}</Text>
    </View>
  );
}
export function ResourceState({
  loading,
  error,
  reload,
}: {
  loading: boolean;
  error: string;
  reload: () => void;
}) {
  if (loading)
    return (
      <View style={ui.row}>
        <ActivityIndicator color={COLORS.black} />
        <Text style={ui.subtitle}>Đang tải dữ liệu...</Text>
      </View>
    );
  if (error)
    return (
      <View style={{ gap: 12 }}>
        <Notice text={error} error />
        <AdminButton title="Thử lại" onPress={reload} secondary />
      </View>
    );
  return null;
}
export function CodeBadge({ code }: { code: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: renderColoryCode(code),
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          fontFamily: FONT_FAMILY.SEMIBOLD,
          fontSize: 13,
          color: COLORS.blackText,
        }}
      >
        {code}
      </Text>
    </View>
  );
}
export function Pagination({
  page,
  total,
  limit,
  onChange,
  disabled,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={ui.spread}>
      <Text style={ui.subtitle}>
        {total} bản ghi · Trang {page}/{Math.max(1, Math.ceil(total / limit))}
      </Text>
      <View style={ui.row}>
        <AdminButton
          title="Trước"
          secondary
          disabled={disabled || page <= 1}
          onPress={() => onChange(page - 1)}
        />
        <AdminButton
          title="Sau"
          secondary
          disabled={disabled || page * limit >= total}
          onPress={() => onChange(page + 1)}
        />
      </View>
    </View>
  );
}
export function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "—";
}
