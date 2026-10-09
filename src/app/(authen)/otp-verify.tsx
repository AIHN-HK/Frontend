import auth from '@/services/auth';
import { passwordRecovery } from '@/helpers/passwordRecovery';
import { showErrorToast } from '@/utilities';
import IconPtit from "@/assets/icon/ic_logoPtit";
import ButtonType2 from "@/components/ButtonType2";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { Padding, TYPOGRAPHY } from "@/utilities/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { SafeAreaView } from "react-native-safe-area-context";

const CELL_COUNT = 6;

const OtpVerifyScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [codeProps, getCellOnLayout] = useClearByFocusCell({
    value,
    setValue,
  });
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setValue("");
  }, []);

  const handleSubmit = async () => {
    if (submitting.current) return;
    if (value.length !== CELL_COUNT) {
      alert("Vui lòng nhập đủ 6 số");
      return;
    }
    submitting.current = true; setBusy(true);
    try {
      await auth.verifyPasswordOtp(email || '', value);
      passwordRecovery.set({email: email || '', otp: value});
      router.push('/(authen)/newpassword');
    } catch (error: any) { showErrorToast(error.response?.data?.message || 'Không xác thực được OTP. Vui lòng thử lại.'); }
    finally { submitting.current = false; setBusy(false); }

  };

  const isWeb = useIsDesktopWeb();

  const spacing = {
    logoToContent: isWeb ? 64 : 40,
    titleToSubtitle: isWeb ? 16 : 12,
    subtitleToCode: isWeb ? 48 : 32,
    codeToButton: isWeb ? 48 : 30,
    buttonToSignup: isWeb ? 56 : 25,
    paddingHorizontal: isWeb ? 760 : Padding.paddingHorizontal,
    cellHorizontalMargin: isWeb ? 8 : 4,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: spacing.paddingHorizontal,
          },
        ]}
      >
        <View style={styles.centerContent}>
          <View style={styles.logoContainer}>
            <IconPtit />
            <Text style={styles.appName}>P Career Guidance</Text>
          </View>

          <View
            style={{
              marginTop: spacing.logoToContent,
              alignItems: "center",
            }}
          >
            <View style={{ marginBottom: spacing.titleToSubtitle }}>
              <Text style={styles.title}>Xác thực mã OTP</Text>
              <Text style={styles.subtitle}>
                Enter the OTP sent to your email
              </Text>
            </View>

            <CodeField
              ref={ref}
              {...codeProps}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete={
                Platform.OS === "android" ? "sms-otp" : "one-time-code"
              }
              renderCell={({ index, symbol, isFocused }) => (
                <Text
                  key={index}
                  style={[
                    styles.cell,
                    isFocused && styles.focusCell,
                    { marginHorizontal: spacing.cellHorizontalMargin },
                  ]}
                  onLayout={getCellOnLayout(index)}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
            <View style={{ marginTop: spacing.subtitleToCode, width: "100%" }}>
              <View style={{ marginBottom: spacing.codeToButton }}>
                <ButtonType2
                  title={busy ? "Đang xác thực…" : "Xác nhận"}
                  colorsbackground={COLORS.green1}
                  colorText={COLORS.blackText}
                  onPress={handleSubmit}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: spacing.buttonToSignup,
              }}
            >
              <Text style={{ ...TYPOGRAPHY.C3 }}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/(authen)/signup")}>
                <Text style={styles.forgotText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OtpVerifyScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    ...TYPOGRAPHY.H5,
    color: COLORS.blackText || "#000",
    marginLeft: 12,
  },
  title: {
    ...TYPOGRAPHY.H3,
    textAlign: "center",
  },
  subtitle: {
    ...TYPOGRAPHY.B3,
    color: COLORS.colortext2,
    textAlign: "center",
  },
  codeFieldRoot: {
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
  },
  cell: {
    width: 38,
    height: 46,
    lineHeight: 40,
    fontSize: 24,
    borderWidth: 2,
    borderColor: "#00000030",
    textAlign: "center",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  focusCell: {
    borderColor: COLORS.green1,
    backgroundColor: "#FFFFFF",
  },
  forgotText: {
    ...TYPOGRAPHY.C3,
    color: "#4D81E7",
    fontWeight: "500",
  },
});
