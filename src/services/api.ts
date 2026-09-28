export enum UserAPI {
  GET_USER_DETAIL = "/user/me",
}
export enum QuizzAPI {
  GET_ALL_QUIZ = "/api/v1/question",
  START_SESSION = "/api/v1/test-session",
  SUBMIT_SESSION = "/api/v1/answer/submit-v2",
  GET_QUIZ_RESULT = "/api/v1/result/analyze-result",
  Get_HISTORY_QUIZ = "/api/v1/test-session/history-by-user",
}
export enum AuthAPI {
  REGISTER_SENDOTP = "/api/v1/auth/register/send-otp",
  REGISTER = "/api/v1/auth/register",
  LOGIN = "/api/v1/auth/login",
  FORGOT_PASSWORD_OTP = "/api/v1/auth/forgot-password/send-otp",
  RESET_PASSWORD = "/api/v1/auth/reset-password",
  TEST_AUTHORIZATION = "/api/v1/auth/test-authorization",
}
