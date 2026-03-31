"use client";

import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { id: "1", name: "IT Department" },
  { id: "2", name: "Human Resources" },
  { id: "3", name: "Finance" },
  { id: "4", name: "Operations" },
  { id: "5", name: "Compliance" },
  { id: "6", name: "Sales" },
  { id: "7", name: "Marketing" },
  { id: "8", name: "Customer Service" },
] as const;

const API_BASE = "http://localhost:8080/api/v1";

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(120, "Cannot exceed 120 characters")
      .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces allowed"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(120, "Cannot exceed 120 characters")
      .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces allowed"),
    email: z
      .string()
      .min(1, "Email is required")
      .max(150, "Cannot exceed 150 characters")
      .regex(
        /^[A-Za-z0-9._%+-]+@gmail\.com$/,
        "Must be a valid @gmail.com address"
      ),
    departmentId: z.string().min(1, "Please select a department"),
    password: z
      .string()
      .min(1, "Password is required")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "8+ chars, upper, lower, number & special char required"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Main Component ───────────────────────────────────────────────────────────

export function RegisterForm({
  onSwitchToLoginAction,
}: {
  onSwitchToLoginAction: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      departmentId: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setApiError("");

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          departmentId: Number(data.departmentId),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setApiError(
          result.message || "Registration failed. Email might already exist."
        );
        return;
      }

      setSuccess(true);
      setTimeout(onSwitchToLoginAction, 1500);
    } catch (_err) {
      setApiError("Something went wrong. Cannot connect to WTMS backend.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-blue-200 bg-white px-10 py-8 shadow-[0_20px_60px_rgba(37,99,235,0.15)]">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-blue-600">
          Registration
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Create an account and get started with WTMS
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* API Error */}
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600"
          >
            {apiError}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-600"
          >
            Registration successful! Redirecting to login…
          </div>
        )}

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm text-slate-600">
              First name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="firstName"
                placeholder="First name"
                autoComplete="given-name"
                {...register("firstName")}
                className={`h-10 bg-slate-50/50 pl-10 text-sm ${
                  errors.firstName ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm text-slate-600">
              Last name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="lastName"
                placeholder="Last name"
                autoComplete="family-name"
                {...register("lastName")}
                className={`h-10 bg-slate-50/50 pl-10 text-sm ${
                  errors.lastName ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm text-slate-600">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              autoComplete="email"
              {...register("email")}
              className={`h-10 bg-slate-50/50 pl-10 text-sm ${
                errors.email ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Department — uses Controller since shadcn Select is uncontrolled */}
        <div className="space-y-1.5">
          <Label htmlFor="department" className="text-sm text-slate-600">
            Department
          </Label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="department"
                    className={`h-10 bg-slate-50/50 pl-10 text-sm ${
                      errors.departmentId ? "border-red-400 focus-visible:ring-red-400" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.departmentId ? (
            <p className="text-xs text-red-500">{errors.departmentId.message}</p>
          ) : (
            <p className="text-xs text-slate-400">
              Choose the department you belong to.
            </p>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-slate-600">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                {...register("password")}
                className={`h-10 bg-slate-50/50 pl-10 pr-10 text-sm ${
                  errors.password ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm text-slate-600">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                {...register("confirmPassword")}
                className={`h-10 bg-slate-50/50 pl-10 pr-10 text-sm ${
                  errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || success}
          className="mt-1 h-11 w-full rounded-xl bg-blue-600 text-sm font-medium shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Registering…
            </span>
          ) : (
            "Register"
          )}
        </Button>

        {/* Switch to login */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLoginAction}
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}