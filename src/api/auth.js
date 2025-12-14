import api from "./apiClient";

export const login = (identifier) => {
  return api.post("/login", { identifier });
};

export const requestOtp = (identifier) => {
  return api.post("/auth/request-otp", { identifier });
};

export const verifyOtp = (identifier, otp) => {
  return api.post("/verify_otp", { identifier, otp });
};
