import { useProfileForm } from "@/modules/profile/hooks/useProfileForm";
import { COLORS } from "@/utilities/colors";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const form = useProfileForm();
  const busy = form.loading || form.saving;
  const button = (title: string, testID: string, onPress: () => void, disabled = false, primary = false) => (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title}
      accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={[styles.button, primary && styles.primary, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
  const textField = (key: "fullname" | "phone" | "address" | "class", label: string) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput testID={`profile-${key}`} accessibilityLabel={label} value={form.draft?.[key] ?? ""}
        editable={!busy} onChangeText={value => form.change(key, value)}
        keyboardType={key === "phone" ? "phone-pad" : key === "class" ? "number-pad" : "default"}
        multiline={key === "address"} style={[styles.input, form.errors[key] && styles.invalid]}
        autoCapitalize={key === "fullname" ? "words" : "none"} />
      {form.errors[key] && <Text accessibilityRole="alert" style={styles.error}>{form.errors[key]}</Text>}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Hồ sơ cá nhân</Text>
          <Text style={styles.subtitle}>Xem và cập nhật thông tin tài khoản của bạn.</Text>
          {busy && <View style={styles.loading}><ActivityIndicator color={COLORS.black} /><Text>{form.saving ? "Đang lưu hồ sơ…" : "Đang tải hồ sơ…"}</Text></View>}
          {!!form.message && <Text testID="profile-message" accessibilityLiveRegion="polite" style={styles.message}>{form.message}</Text>}
          {form.signedOut && button("Đăng nhập", "profile-login", () => router.replace("/(authen)"))}
          {!form.profile && !form.loading && !form.signedOut && button("Thử tải lại", "profile-reload", form.reload)}
          {form.profile && form.draft && <>
            {form.reviewed && <View testID="profile-server-snapshot" style={styles.snapshot}>
              <Text style={styles.label}>Hồ sơ hiện tại trên máy chủ</Text>
              <Text>Họ và tên: <Text testID="profile-server-fullname">{form.profile.fullname}</Text></Text>
              <Text>Số điện thoại: {form.profile.phone ?? "Chưa có"}</Text>
              <Text>Địa chỉ: {form.profile.address || "Chưa có"}</Text>
              <Text>Giới tính: {form.profile.gender === "MALE" ? "Nam" : form.profile.gender === "FEMALE" ? "Nữ" : form.profile.gender === "OTHER" ? "Khác" : "Chưa chọn"}</Text>
              <Text>Lớp: {form.profile.class ?? "Chưa có"}</Text>
              <Text style={styles.hint}>Các ô bên dưới vẫn giữ dữ liệu bạn đang nhập. Chọn Hủy thay đổi nếu muốn dùng hồ sơ trên máy chủ.</Text>
            </View>}
            <Text style={styles.label}>Email (chỉ đọc)</Text>
            <TextInput testID="profile-email" accessibilityLabel="Email (chỉ đọc)" value={form.profile.email} editable={false} style={[styles.input, styles.readOnly]} />
            <Text style={styles.age}>Tuổi: {form.profile.age}</Text>
            {textField("fullname", "Họ và tên *")}
            {textField("phone", "Số điện thoại *")}
            {textField("address", "Địa chỉ")}
            <View style={styles.field}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.options}>
                {([['', 'Chưa chọn'], ['MALE', 'Nam'], ['FEMALE', 'Nữ'], ['OTHER', 'Khác']] as const).map(([value, label]) => (
                  <Pressable key={value} testID={`profile-gender-${value || 'unset'}`} accessibilityRole="radio"
                    accessibilityLabel={label} accessibilityState={{selected:form.draft?.gender === value, disabled:busy}}
                    disabled={busy} onPress={() => form.change("gender", value)}
                    style={[styles.option, form.draft?.gender === value && styles.selected]}><Text>{label}</Text></Pressable>
                ))}
              </View>
              {form.errors.gender && <Text style={styles.error}>{form.errors.gender}</Text>}
            </View>
            {textField("class", "Lớp (1–12)")}
            {form.unknownOutcome && button("Tải lại để kiểm tra", "profile-review", form.reload, busy)}
            <View style={styles.actions}>
              {button(form.saving ? "Đang lưu…" : "Lưu hồ sơ", "profile-save", form.save, busy || form.unknownOutcome, true)}
              {button("Hủy thay đổi", "profile-cancel", form.cancel, busy || form.unknownOutcome)}
              {button("Tải lại hồ sơ", "profile-reload", form.reload, busy)}
            </View>
            <Text testID="profile-hint" style={styles.hint}>* Trường bắt buộc. Tải lại giữ dữ liệu đang nhập để bạn kiểm tra. Hủy thay đổi dùng hồ sơ đã tải gần nhất.</Text>
          </>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.basegrey },
  scroll: { padding: 20, paddingBottom: 120, alignItems: "center" },
  card: { width: "100%", maxWidth: 720, backgroundColor: COLORS.white, borderRadius: 18, padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.blackText },
  subtitle: { fontSize: 15, lineHeight: 22, color: COLORS.colortext2, marginBottom: 8 },
  loading: { flexDirection: "row", gap: 10, alignItems: "center" },
  field: { gap: 8 },
  snapshot: { padding: 14, gap: 8, borderRadius: 10, backgroundColor: COLORS.basegrey },
  label: { fontSize: 15, fontWeight: "500", color: COLORS.colortext1 },
  input: { borderWidth: 1, borderColor: COLORS.basegrey4, borderRadius: 10, padding: 12, minHeight: 46, fontSize: 16, color: COLORS.blackText },
  readOnly: { backgroundColor: COLORS.basegrey, color: COLORS.grey },
  age: { color: COLORS.grey, marginBottom: 4 },
  invalid: { borderColor: "#B42318" },
  error: { color: "#B42318", fontSize: 13 },
  message: { backgroundColor: COLORS.yellow2, borderRadius: 8, padding: 12, fontSize: 14, lineHeight: 21 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { borderWidth: 1, borderColor: COLORS.basegrey4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  selected: { backgroundColor: COLORS.purple2, borderColor: COLORS.black },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  button: { minHeight: 44, justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: COLORS.basegrey },
  primary: { backgroundColor: COLORS.green1 },
  disabled: { opacity: 0.45 },
  buttonText: { color: COLORS.blackText, fontWeight: "600", fontSize: 14 },
  hint: { color: COLORS.grey, fontSize: 12, lineHeight: 18 },
});
