"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import { registerUser } from "@/action/Auth";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Metadata } from "../Metadata";

type State = {
  error: string | null;
  success: boolean;
};

export default function RegisterPage() {
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState<State, FormData>(
    async (prevState, formData) => {
      const rawFormData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      };

      try {
        await registerUser(rawFormData);
        setIsAuthenticated(true);
        return { error: null, success: true };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Registration failed",
          success: false,
        };
      }
    },
    { error: null, success: false }
  );

  useEffect(() => {
    if (state.success) {
      toast("Registration Successful");
      router.push("/");
    } else if (state.error) {
      toast("Registration Failed");
    }
  }, [state.success, state.error, router]);

  return (
    <>
      <Metadata
        seoTitle="Register"
        seoDescription="Create an account to start watching movies and TV shows."
        seoKeywords="register account for watch movies and tv shows"
      />

      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="w-full max-w-md">
          <div className="bg-transparent backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-800">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-gray-400">Join us and start watching</p>
            </div>

            {state.error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {state.error}
              </div>
            )}

            <form action={dispatch} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-300"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full bg-transparent border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                    required
                    className="w-full bg-transparent border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Enter your email"
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
                    required
                    className="w-full bg-transparent border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
