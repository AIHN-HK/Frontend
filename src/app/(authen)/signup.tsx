import IconHide from "@/assets/icon/ic_hide";
import ButtonType2 from "@/components/ButtonType2";
import TextField2 from "@/components/DatePicker";
import TextField from "@/components/TextField";
import TextFieldPhoneNumber from "@/components/TextFieldPhoneNumber";
import { userPhoneData } from "@/constants/phonePrefixes";
import PhoneNumberVerify from "@/modules/authentication/components/OtpCode";
import {
  useSignUp,
  useSignUpForm,
} from "@/modules/authentication/hooks/useSignUpForm";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { COLORS } from "@/utilities/colors";
import { useRouter } from "expo-router";
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

const SignUpScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useSignUpForm();

  const {
    onSubmit,
    handleVerifyOtp,
    showOtpModal,
    setShowOtpModal,
    signUpError,
    isLoading,
  } = useSignUp();

  const isWeb = useIsDesktopWeb();

  const spacing = {
    logoToTitle: isWeb ? 80 : 48,
    titleToForm: isWeb ? 56 : 36,
    fieldGap: isWeb ? 24 : 16,
    formToButton: isWeb ? 48 : 32,
    buttonToLink: isWeb ? 64 : 32,
    containerPaddingHorizontal: isWeb ? 760 : 24,

    maxContentWidth: isWeb ? 760 : undefined,
    formMaxWidth: isWeb ? 420 : undefined,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          { paddingHorizontal: spacing.containerPaddingHorizontal },
        ]}
      >
        <View
          style={[
            styles.centerContent,
            {
              width: "100%",
              alignSelf: "center",
              ...(isWeb ? { maxWidth: 480 } : {}),
            },
          ]}
        >
          <View style={styles.logoContainer}>
            {/* <IconPtit /> */}
            <Text style={styles.appName}>P Career Guidance</Text>
          </View>

          <View style={{ marginTop: spacing.logoToTitle }}>
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subTitle}>Create an account to continue!</Text>
          </View>

          <View
            style={[
              styles.formContainer,
              {
                marginTop: spacing.titleToForm,

                ...(isWeb ? { maxWidth: 420 } : {}),
              },
            ]}
          >
            <View style={styles.errorContainer}>
              {signUpError && (
                <Text style={styles.loginErrorText}>{signUpError}</Text>
              )}
            </View>

            <View style={{ gap: spacing.fieldGap, width: "100%" }}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    placeholder="Họ tên của bạn"
                    value={value}
                    onChange={onChange}
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    placeholder="Email"
                    value={value}
                    onChange={onChange}
                    error={errors.email?.message}
                    trimWhitespace={true}
                  />
                )}
              />

              <Controller
                control={control}
                name="birthDate"
                rules={{ required: "Vui lòng chọn ngày sinh" }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField2
                    placeholder="Ngày sinh"
                    value={value ?? ""}
                    onChange={onChange}
                    error={error?.message}
                    mode="date"
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Controller
                    control={control}
                    name="countryCode"
                    render={({
                      field: { onChange: onCodeChange, value: codeValue },
                    }) => (
                      <TextFieldPhoneNumber
                        dataList={userPhoneData}
                        label={
                          userPhoneData.find((item) => item.value === codeValue)
                            ?.label || "VIE"
                        }
                        value={codeValue}
                        onChange={(item) => onCodeChange(item.value)}
                        phoneNumber={codeValue}
                        userPhone={value}
                        onChangeText={onChange}
                        error={errors.phone?.message}
                      />
                    )}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    placeholder="Mật khẩu ít nhất có 8 kí tự"
                    value={value}
                    onChange={onChange}
                    rightIcon={<IconHide />}
                    secureTextEntry={!showPassword}
                    error={errors.password?.message}
                    onPressRightIcon={() => setShowPassword(!showPassword)}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <TextField
                    placeholder="Nhập lại mật khẩu"
                    value={value}
                    onChange={onChange}
                    secureTextEntry={!showConfirmPassword}
                    rightIcon={<IconHide />}
                    error={errors.confirmPassword?.message}
                    onPressRightIcon={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
                )}
              />
            </View>
          </View>

          <View style={{ marginTop: spacing.formToButton, width: "100%" }}>
            <ButtonType2
              title="Đăng ký tài khoản"
              colorsbackground={COLORS.green1}
              colorText={COLORS.blackText}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              marginTop: spacing.buttonToLink,
              alignItems: "center",
            }}
          >
            <Text style={styles.linkText}>Bạn đã có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => !isLoading && router.push("/(authen)")}
            >
              <Text style={styles.forgotText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PhoneNumberVerify
        visible={showOtpModal}
        title="Xác thực mã OTP"
        description="Nhập mã OTP đã gửi đến email của bạn"
        onPress={handleVerifyOtp}
        onClose={() => setShowOtpModal(false)}
      />
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    fontSize: Platform.select({ web: 32, default: 26 }),
    fontWeight: "700",
    color: COLORS.blackText || "#000",
    marginLeft: 12,
  },
  title: {
    fontSize: Platform.select({ web: 36, default: 32 }),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.colortext2,
    textAlign: "center",
    marginTop: 4,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: COLORS.blackText,
  },
  forgotText: {
    fontSize: 14,
    color: "#4D81E7",
    fontWeight: "500",
  },
  errorContainer: {
    height: 24,
    justifyContent: "center",
    marginBottom: 8,
  },
  loginErrorText: {
    color: "red",
    fontSize: 13,
    textAlign: "center",
  },
});
