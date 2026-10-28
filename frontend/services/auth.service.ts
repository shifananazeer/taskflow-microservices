
import { apiRequest } from "./api";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse
} from "../types/auth.types";

export function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function getMyProfile(token: string) {
  return apiRequest("/auth/profile", {
    method: "GET",
    token,
  });
}



export function registerUser(
  credentials: RegisterCredentials
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: credentials,
  });
}