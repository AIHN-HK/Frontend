import { passwordRecovery } from '@/helpers/passwordRecovery';
import IconHide from "@/assets/icon/ic_hide";
import IconPtit from "@/assets/icon/ic_logoPtit";
import ButtonType2 from "@/components/ButtonType2";
import TextField from "@/components/TextField";
import {
  useNewPassword,
  useNewPasswordForm,
} from "@/modules/authentication/hooks/useNewPasswordForm";
import { NewpasswordFormData } from "@/modules/authentication/schemas/newPasswordSchema";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { Padding, TYPOGRAPHY } from "@/utilities/typography";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
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

const NewpasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? insets.top : 0;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { onSubmit, isLoading } = useNewPassword();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useNewPasswordForm();
  const recovery = passwordRecovery.get();
  const isWeb = useIsDesktopWeb();
  if (!recovery) return <Redirect href="/(authen)/resetpassword" />;
  const { email, otp } = recovery;

  const onFormSubmit = (data: NewpasswordFormData) => {
    onSubmit(data, email, otp);
  };
  const spacing = {
    logoToTitle: isWeb ? 64 : 40,
    titleToForm: isWeb ? 48 : 32,
    fieldToField: isWeb ? 28 : 16,
    formToButton: isWeb ? 48 : 24,
    buttonToLoginLink: isWeb ? 56 : 25,
    paddingHorizontal: isWeb ? 760 : Padding.paddingHorizontal,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingTop: topPadding,
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
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subTitle}>Reset your password</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={{ marginBottom: spacing.fieldToField }}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    placeholder="Mật khẩu ít nhất có 8 kí tự"
                    value={value}
                    onChange={onChange}
                    rightIcon={<IconHide />}
                    error={errors.password?.message}
                    secureTextEntry={!showPassword}
                    onPressRightIcon={() => setShowPassword(!showPassword)}
                  />
                )}
              />
            </View>

            <View style={{ marginBottom: spacing.formToButton }}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    placeholder="Nhập lại mật khẩu"
                    value={value}
                    onChange={onChange}
                    rightIcon={<IconHide />}
                    secureTextEntry={!showConfirmPassword}
                    error={errors.confirmPassword?.message}
                    onPressRightIcon={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
                )}
              />
            </View>
          </View>

          <View style={{ marginBottom: spacing.buttonToLoginLink }}>
            <ButtonType2
              title={"Xác nhận"}
              colorsbackground={COLORS.green1}
              colorText={COLORS.blackText}
              onPress={handleSubmit(onFormSubmit)}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: spacing.buttonToLoginLink,
            }}
          >
            <Text style={{ ...TYPOGRAPHY.C3 }}>Bạn đã có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => {
                !isLoading && router.push("/(authen)");
              }}
            >
              <Text style={styles.forgotText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewpasswordScreen;

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
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.blackText || "#000",
    marginLeft: 12,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    ...TYPOGRAPHY.H3,
  },
  subTitle: {
    ...TYPOGRAPHY.C3,
    marginTop: 8,
    color: COLORS.colortext1,
    textAlign: "center",
  },

  formContainer: {
    width: "100%",
    alignItems: "center",
  },

  forgotText: {
    fontSize: 14,
    color: "#4D81E7",
    fontWeight: "500",
    ...TYPOGRAPHY.C3,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
    alignSelf: "flex-start",
  },
});
