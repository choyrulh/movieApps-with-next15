"use server";

import { RegisterFormData, LoginFormData, AuthResponse } from "@/types/auth";

const base_url = process.env.BASE_URL_BACKEND;

export const loginUser = async (
  formData: LoginFormData
): Promise<AuthResponse> => {
  const res = await fetch(`${base_url}auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  if (!res.ok || data.status === "error") {
    return {
      status: "error",
      message: data.message || "Login failed. Please try again.",
      data: {
        user: {
          _id: 0,
          name: "",
          email: "",
        },
      },
    };
  }

  return data;
};

export const registerUser = async (
  formData: RegisterFormData
): Promise<AuthResponse> => {
  const res = await fetch(`${base_url}auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Register failed");
  }

  return data;
};

export const logoutUser = async (): Promise<void> => {
  const data = await fetch(`${base_url}auth/logout`, {
    method: "POST",
  });

  if (!data.ok) {
    throw new Error("Logout failed");
  }

  return;
};
