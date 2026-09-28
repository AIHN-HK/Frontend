import IconBox from "@/assets/icon/ic_box";
import IconCheckedBox from "@/assets/icon/ic_checkedbox";
import IconHide from "@/assets/icon/ic_hide";
import ButtonType2 from "@/components/ButtonType2";
import TextField from "@/components/TextField";
import {
  useLogin,
  useLoginForm,
} from "@/modules/authentication/hooks/useLoginForm";
import { COLORS } from "@/utilities/colors";
import { useIsDesktopWeb } from "@/hooks/useIsDesktopWeb";
import { Padding, TYPOGRAPHY } from "@/utilities/typography";
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

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "android" ? insets.top : 0;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [checkedBox, setCheckedBox] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useLoginForm();
  const { loginError, onSubmit, isLoading } = useLogin();
  const isWeb = useIsDesktopWeb();
  const spacing = {
    logoToTitle: isWeb ? 64 : 40,
    titleToSubtitle: isWeb ? 16 : 8,
    subtitleToForm: isWeb ? 48 : 32,
    fieldToField: isWeb ? 12 : 4,
    passwordToCheckbox: isWeb ? 16 : 8,
    checkboxToButton: isWeb ? 48 : 28,
    buttonToSignup: isWeb ? 56 : 32,
    paddingHorizontal: isWeb ? 760 : Padding.paddingHorizontal,
    signupPaddingVertical: isWeb ? 56 : 25,
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
            {/* <IconPtit /> */}
            <Text style={styles.appName}>P Career Guidance</Text>
          </View>

          <View
            style={{
              marginTop: spacing.logoToTitle,
              marginBottom: spacing.titleToSubtitle,
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subTitle}>
              Enter your email and password to log in
            </Text>
          </View>

          <View
            style={[
              styles.formContainer,
              { marginBottom: spacing.checkboxToButton },
            ]}
          >
            <View style={styles.errorContainer}>
              {loginError && (
                <Text style={styles.loginErrorText}>{loginError}</Text>
              )}
            </View>

            <View style={{ marginBottom: spacing.fieldToField }}>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange } }) => (
                  <TextField
                    placeholder="Số điện thoại hoặc email"
                    value={value}
                    trimWhitespace={true}
                    onChange={onChange}
                    error={errors.email?.message}
                  />
                )}
              />
            </View>

            <View style={{ marginBottom: spacing.passwordToCheckbox }}>
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <TextField
                    placeholder="Mật khẩu"
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

            <View
              style={[
                styles.checkboxContainer,
                { marginTop: spacing.passwordToCheckbox },
              ]}
            >
              <View style={styles.rememberMe}>
                <TouchableOpacity onPress={() => setCheckedBox(!checkedBox)}>
                  {checkedBox ? <IconBox /> : <IconCheckedBox />}
                </TouchableOpacity>
                <Text style={styles.rememberText}>Remember me</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(authen)/resetpassword")}
              >
                <Text style={styles.forgotText}>Forgot Password ?</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: spacing.buttonToSignup }}>
            <ButtonType2
              title="Đăng nhập"
              colorsbackground={COLORS.green1}
              colorText={COLORS.blackText}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <View
            style={[
              styles.signupPrompt,
              { paddingVertical: spacing.signupPaddingVertical },
            ]}
          >
            <Text style={{ ...TYPOGRAPHY.C3 }}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/(authen)/signup")}>
              <Text style={styles.signupLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
    ...TYPOGRAPHY.H5,
    color: COLORS.blackText,
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
  },
  errorContainer: {
    height: 24,
    justifyContent: "center",
  },
  loginErrorText: {
    color: "red",
    fontSize: 12,
  },
  checkboxContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.grey,
  },
  forgotText: {
    ...TYPOGRAPHY.C4,
    color: "#4D81E7",
    fontWeight: "500",
  },
  signupPrompt: {
    flexDirection: "row",
  },
  signupLink: {
    ...TYPOGRAPHY.C3,
    color: "#4D81E7",
    fontWeight: "500",
  },
});
// import IconAvartar1 from "@/assets/icon/ic_avartar";
// import IconEdit from "@/assets/icon/ic_edit";
// import PhoneNumberVerify from "@/modules/authentication/components/OtpCode";
// import {
//   useSignUp,
//   useSignUpForm,
// } from "@/modules/authentication/hooks/useSignUpForm";
// import TextField3 from "@/modules/profile/components/profilefields";
// import { capitalizeFirstLetter } from "@/utilities";

// import { COLORS } from "@/utilities/colors";
// import { TYPOGRAPHY } from "@/utilities/typography";
// import { useRouter } from "expo-router";
// import { useState } from "react";
// import { Controller } from "react-hook-form";
// import { Platform, StyleSheet, Text, View } from "react-native";
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";

// const ProfileScreen = () => {
//   const insets = useSafeAreaInsets();
//   const topPadding = Platform.OS === "android" ? insets.top : 0;
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useSignUpForm();

//   const {
//     onSubmit,
//     handleVerifyOtp,
//     showOtpModal,
//     setShowOtpModal,
//     signUpError,
//     isLoading,
//   } = useSignUp();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={[styles.container, { paddingTop: topPadding }]}>
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.greeting}>Good Morning!</Text>
//             <Text style={styles.username}>Thi Hong Nhung Ngo</Text>
//             <View style={[styles.badge]}>
//               <Text style={styles.badgeLabel}>Nhóm ngành</Text>
//               <Text style={styles.badgeValue}>
//                 {capitalizeFirstLetter("Ky Su")}
//               </Text>
//             </View>
//           </View>
//           <IconAvartar1 />
//         </View>
//         <View style={styles.centerContent}>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//             }}
//           >
//             <Text style={{ ...TYPOGRAPHY.B2 }}>Thông tin cá nhân</Text>
//             <IconEdit />
//           </View>
//           <View style={styles.formContainer}>
//             <View style={styles.errorContainer}>
//               {signUpError && (
//                 <Text style={styles.loginErrorText}>{signUpError}</Text>
//               )}
//             </View>
//             <Controller
//               control={control}
//               name="fullName"
//               render={({ field: { onChange, value } }) => (
//                 <TextField3
//                   label="Họ và tên"
//                   placeholder="Nhập họ và tên"
//                   value={value || ""}
//                   onChange={onChange}
//                   error={errors.fullName?.message}
//                 />
//               )}
//             />
//             <Controller
//               control={control}
//               name="fullName"
//               render={({ field: { onChange, value } }) => (
//                 <TextField3
//                   label="Họ và tên"
//                   placeholder="Nhập họ và tên"
//                   value={value || ""}
//                   onChange={onChange}
//                   error={errors.fullName?.message}
//                 />
//               )}
//             />
//             <Controller
//               control={control}
//               name="fullName"
//               render={({ field: { onChange, value } }) => (
//                 <TextField3
//                   label="Họ và tên"
//                   placeholder="Nhập họ và tên"
//                   value={value || ""}
//                   onChange={onChange}
//                   error={errors.fullName?.message}
//                 />
//               )}
//             />
//             <Controller
//               control={control}
//               name="fullName"
//               render={({ field: { onChange, value } }) => (
//                 <TextField3
//                   label="Họ và tên"
//                   placeholder="Nhập họ và tên"
//                   value={value || ""}
//                   onChange={onChange}
//                   error={errors.fullName?.message}
//                 />
//               )}
//             />
//             <Controller
//               control={control}
//               name="fullName"
//               render={({ field: { onChange, value } }) => (
//                 <TextField3
//                   label="Họ và tên"
//                   placeholder="Nhập họ và tên"
//                   value={value || ""}
//                   onChange={onChange}
//                   error={errors.fullName?.message}
//                 />
//               )}
//             />
//             <Controller
//               control={control}
//               name="fullName"
//               render={({ field: { onChange, value } }) => (
//                 <TextField3
//                   label="Họ và tên"
//                   placeholder="Nhập họ và tên"
//                   value={value || ""}
//                   onChange={onChange}
//                   error={errors.fullName?.message}
//                 />
//               )}
//             />
//           </View>
//         </View>
//       </View>
//       <PhoneNumberVerify
//         visible={showOtpModal}
//         title="Xác thực mã OTP"
//         description="Nhập mã OTP đã gửi đến email của bạn"
//         onPress={handleVerifyOtp}
//         onClose={() => {
//           setShowOtpModal(false);
//         }}
//       />
//     </SafeAreaView>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },

//   container: {
//     flex: 1,
//     paddingHorizontal: 24,
//     backgroundColor: COLORS.white,
//   },

//   centerContent: {
//     flex: 1,
//     marginTop: 30,
//   },

//   logoContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   appName: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: COLORS.blackText || "#000",
//     marginLeft: 12,
//   },

//   title: {
//     paddingTop: 24,
//     paddingBottom: 8,
//     fontSize: 32,
//     fontWeight: "700",
//     textAlign: "center",
//   },

//   subTitle: {
//     fontSize: 12,
//     color: COLORS.colortext2,
//     textAlign: "center",
//   },

//   formContainer: {
//     width: "100%",
//     alignItems: "center",
//     marginBottom: 24,
//   },

//   forgotText: {
//     fontSize: 12,
//     color: "#4D81E7",
//     fontWeight: "500",
//   },

//   errorText: {
//     color: "red",
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 16,
//     alignSelf: "flex-start",
//   },
//   errorContainer: {
//     height: 18,
//     justifyContent: "center",
//   },
//   loginErrorText: {
//     color: "red",
//     fontSize: 12,
//   },
//   header: {
//     paddingTop: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   greeting: { ...TYPOGRAPHY.B1, color: COLORS.black, fontWeight: "400" },
//   username: {
//     ...TYPOGRAPHY.B2,
//     fontWeight: "500",
//     color: COLORS.black,
//     marginTop: 2,
//   },
//   badge: {
//     flexDirection: "row",
//     marginTop: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     alignSelf: "flex-start",
//     alignItems: "center",
//   },
//   badgeLabel: {
//     ...TYPOGRAPHY.S1,
//     fontWeight: "400",
//     color: COLORS.colortext2,
//     marginRight: 6,
//   },
//   badgeValue: { ...TYPOGRAPHY.S2, fontWeight: "500", color: COLORS.colortext1 },
// });
