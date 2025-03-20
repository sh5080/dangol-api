export const AuthErrorMessage = {
  LOGIN_REQUIRED: "로그인이 필요합니다.",
  ACCESS_TOKEN_MISSING: "Access token이 없습니다.",
  REFRESH_TOKEN_MISSING: "Refresh token이 없습니다.",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",
  MISMATCH_COUNTED: "5회 이상 틀린 경우 계정이 제한됩니다.",
  ACCOUNT_BLOCKED: "제한된 계정입니다.",
  FORBIDDEN: "접근이 금지되었습니다.",
  SESSION_NOT_FOUND: "세션이 확인되지 않습니다.",
} as const;
export const TokenErrorMessage = {
  TOKEN_EXPIRED: "만료된 토큰입니다.",
  TOKEN_INVALID: "유효하지 않은 토큰입니다.",
} as const;

export const UserErrorMessage = {
  USER_NOT_FOUND: "조회된 유저가 없습니다.",
  EMAIL_CONFLICTED: "이메일이 이미 사용 중입니다.",
  NICKNAME_CONFLICTED: "닉네임이 이미 사용 중입니다.",
  INVALID_CODE: "유효하지 않은 코드입니다.",
  PERMISSION_NOT_FOUND: "권한이 없습니다.",
} as const;

export const DefaultErrorMessage = {
  SYNTAX: "유효하지 않은 입력값입니다.",
  UNCORRECTED_FORM: "유효하지 않은 형식입니다.",
  REQUIRED: "필수 입력값을 입력해주세요.",
  BAD_REQUEST: "잘못된 요청입니다.",
  UNEXPECTED_1: "예기치 않은 오류입니다.",
  UNEXPECTED_2: "일시적인 오류입니다. 잠시 후 다시 시도해주세요.",
  SEARCH_NOT_FOUND: "검색 결과가 없습니다.",
  FORBIDDEN: "접근이 금지되었습니다.",
  DUPLICATED_ID: "ID는 중복될 수 없습니다.",
  NOT_FOUND: "값이 존재하지 않습니다.",
} as const;
