export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: "success" | "error";
  token?: string;
  message: string;
  data: {
    user: {
      _id: number;
      name: string;
      email: string;
    };
  };
}
