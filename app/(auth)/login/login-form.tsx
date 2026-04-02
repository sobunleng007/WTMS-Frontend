"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { authService } from "@/service/auth/auth.service"; // ✅ correct hook
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  onSwitchToRegisterAction,
  onSwitchToForgotPasswordAction,
}: {
  onSwitchToRegisterAction: () => void;
  onSwitchToForgotPasswordAction?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login); // ✅ correct
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Call the Java Spring Boot Backend
      const response = await authService.login({ email, password });

      // 2. Save tokens to Zustand + LocalStorage
      const { accessToken, refreshToken, user } = response.payload || {};
      if (!accessToken) {
        setError(
          "No access token returned from backend. Check API response format.",
        );
        setLoading(false);
        return;
      }
      login({ accessToken, refreshToken, user }); // ✅ Zustand store updates and persists to localStorage

      // 3. Redirect
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-4xl bg-white border border-blue-200 p-10 shadow-[0_20px_60px_rgba(37,99,235,0.15)]">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-wide text-blue-600">
          Login
        </h2>
        <p className="text-sm text-slate-500">
          Sign in to access your WTMS account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 animate-in fade-in zoom-in-95">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-600">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-slate-50/50 pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-600">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Input password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 pl-10 pr-10 bg-slate-50/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-3 pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPasswordAction}
              className="text-sm font-medium text-red-500 transition-colors hover:text-red-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Verifying...
            </span>
          ) : (
            "Login to WTMS"
          )}
        </Button>

        <div className="pt-2 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegisterAction}
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline cursor-pointer"
          >
            Register
          </button>
        </div>

        <button
          type="button"
          className="flex cursor-pointer h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white text-base font-medium text-slate-400 shadow-sm transition-all hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" className="size-5">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Login with Google
        </button>
      </form>
    </div>
  );
}
