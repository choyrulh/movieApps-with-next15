"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, Mail, LogIn } from "lucide-react";
import { loginUser } from "@/action/Auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Metadata } from "../Metadata";

const initialState = {
  email: "",
  password: "",
  error: null,
};
export default function LoginPage() {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const [formState, dispatch, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      try {
        const response = await loginUser({ email, password });

        if (response.status === "success" && response.token) {
          // localStorage.setItem("user", JSON.stringify(response.token));
          document.cookie = `user=${response.token}; path=/; max-age=604800; SameSite=Lax`; // Set cookie dengan durasi 1 minggu jam
          setIsAuthenticated(true);
          toast(response.message);

          router.push("/"); // Redirect ke dashboard atau halaman utama
          return { error: null };
        }

        // Jika gagal login, tampilkan error
        return { error: response.message || "Login failed. Please try again." };
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
        };
      }
    },
    initialState
  );

  return (
    <>
      <Metadata
        seoTitle="Login"
        seoDescription="Sign in to your account to continue watching movies and TV shows."
        seoKeywords="login, movies, tv shows"
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-green-600 rounded-full mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-400">Sign in to continue watching</p>
            </div>

            {formState?.error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {formState.error}
              </div>
            )}

            <form action={dispatch} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-300"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full bg-white/5 border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="w-full bg-white/5 border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
