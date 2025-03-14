export const AuthErrorMessage = {
  LOGIN_REQUIRED: "Login is required.",
  ACCESS_TOKEN_MISSING: "Access token is missing.",
  REFRESH_TOKEN_MISSING: "Refresh token is missing.",
  PASSWORD_MISMATCH: "Password is incorrect.",
  MISMATCH_COUNTED: "Account is restricted after 5 errors.",
  ACCOUNT_BLOCKED: "Restricted account.",
  FORBIDDEN: "Forbidden access.",
  SESSION_NOT_FOUND: "Session not found.",
} as const;
export const TokenErrorMessage = {
  TOKEN_EXPIRED: "Expired token.",
  TOKEN_INVALID: "Invalid token.",
} as const;

export const UserErrorMessage = {
  USER_NOT_FOUND: "User not found.",
  EMAIL_CONFLICTED: "Email already in use.",
  NICKNAME_CONFLICTED: "Nickname already in use.",
  INVALID_CODE: "Invalid code.",
} as const;

export const DefaultErrorMessage = {
  SYNTAX: "Not a valid input value.",
  UNCORRECTED_FORM: "Not a valid form.",
  REQUIRED: "Please enter the required value.",
  UNEXPECTED_1: "Unexpected error.",
  UNEXPECTED_2: "Temporary error. Please try again later.",
  SEARCH_NOT_FOUND: "Search result not found.",
  FORBIDDEN: "Unauthorized access.",
  DUPLICATED_ID: "ID cannot be duplicated.",
  NOT_FOUND: "Value does not exist.",
} as const;
