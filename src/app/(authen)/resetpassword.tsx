import IconPtit from "@/assets/icon/ic_logoPtit";
import ButtonType2 from "@/components/ButtonType2";
import TextField from "@/components/TextField";
import {
  useResetPassword,
  useResetPasswordForm,
} from "@/modules/authentication/hooks/useResetPasswordForm";
import { screenWidth } from "@/utilities";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { Padding, TYPOGRAPHY } from "@/utilities/typography";
import { useRouter } from "expo-router";
import { Controller } from "react-hook-form";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ResetPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? insets.top : 40;
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useResetPasswordForm();
  const { handleVerifyOtp, onSubmitEmail } = useResetPassword(reset);
  const handleContinue = (data: { email: string }) => {
    onSubmitEmail(data);
    router.push({
      pathname: "/(authen)/otp-verify",
      params: {
        email: data.email,
        title: "Xác thực mã OTP",
        description:
          "Nếu email tồn tại, hệ thống đã gửi mã OTP đến email của bạn",
      },
    });
  };

  const isWeb = useIsDesktopWeb();

  const spacing = {
    logoToTitle: isWeb ? 64 : 40,
    titleToForm: isWeb ? 48 : 28,
    formToButton: isWeb ? 48 : 24,
    buttonToSignup: isWeb ? 56 : 25,
    paddingHorizontal: isWeb ? 760 : Padding.paddingHorizontal,
    subtitlePaddingHorizontal: isWeb ? screenWidth / 8 : screenWidth / 10,
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
              marginTop: spacing.logoToTitle,
              marginBottom: spacing.titleToForm,
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text
              style={[
                styles.subTitle,
                { paddingHorizontal: spacing.subtitlePaddingHorizontal },
              ]}
            >
              Enter your email to reset password
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextField
                  placeholder="Email của bạn"
                  value={value}
                  onChange={onChange}
                  error={errors.email?.message}
                />
              )}
            />
          </View>
          <View style={{ marginBottom: spacing.buttonToSignup }}>
            <ButtonType2
              title="Tiếp tục"
              colorsbackground={COLORS.green1}
              colorText={COLORS.blackText}
              onPress={handleSubmit(handleContinue)}
            />
          </View>
          <View
            style={{ flexDirection: "row", marginTop: spacing.buttonToSignup }}
          >
            <Text style={{ ...TYPOGRAPHY.C3 }}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/(authen)/signup")}>
              <Text style={styles.forgotText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

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
    paddingBottom: 8,
    ...TYPOGRAPHY.H3,
    textAlign: "center",
  },
  subTitle: {
    ...TYPOGRAPHY.C3,
    color: COLORS.colortext2,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  forgotText: {
    ...TYPOGRAPHY.C3,
    color: "#4D81E7",
    fontWeight: "500",
  },
});
