"use client";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/tanstack/mutation/auth.mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useState } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "h-11 w-full rounded-full border bg-transparent px-11 pr-12 text-sm text-[#f1efe7] outline-none transition placeholder:text-[#aaa69a]";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      router.push("/chat");
    } catch (err: any) {
      const message = err?.message || "Login failed. Please try again.";
      setError("root", { message });
    }
  };

  return (
    <main className="max-h-screen">
      <div className="grid min-h-screen overflow-hidden lg:grid-cols-2 lg:border lg:border-[#5a584f]">
        <section className="relative hidden overflow-hidden lg:flex lg:min-h-full lg:items-center lg:px-24">
          <Image src="/login.png" alt="Login Background" width={720} height={960} className="absolute inset-0 h-full w-full object-cover" />
        </section>

        <section className="flex min-h-screen items-center justify-center bg-primary px-6 py-12 lg:min-h-0 lg:px-10">
          <div className="w-full max-w-1/2 text-[#eeece4]">
            <div className="mb-7 text-center">
              <h1 className="font-serif text-4xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[#d1cec2]">
                Please enter your details.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Username or Email */}
              <div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c1bcaa]" />
                  <input
                    {...register("usernameOrEmail")}
                    aria-label="Username or email"
                    className={cn(fieldBase, errors.usernameOrEmail ? "border-red-400 focus:border-red-400" : "border-[#9e9a88] focus:border-[#c97955]")}
                    placeholder="Username or Email"
                    type="text"
                    autoComplete="username"
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="mt-1.5 pl-4 text-xs text-red-400">{errors.usernameOrEmail.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c1bcaa]" />
                  <input
                    {...register("password")}
                    aria-label="Password"
                    className={cn(fieldBase, errors.password ? "border-red-400 focus:border-red-400" : "border-[#9e9a88] focus:border-[#c97955]")}
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                  />
                  <button
                    aria-label="Toggle password visibility"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c1bcaa]"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 pl-4 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="text-right">
                <button
                  className="text-xs font-medium text-[#c97955] transition hover:text-[#e2916b]"
                  type="button"
                >
                  Forgot password?
                </button>
              </div>

              {/* Root / server error */}
              {errors.root && (
                <p className="text-center text-xs text-red-400">{errors.root.message}</p>
              )}

              <button
                className="!mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#c97955] text-sm font-medium text-[#fff8ed] transition hover:bg-[#db8962] disabled:opacity-50"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Log In"}{" "}
                <ArrowRight className="size-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#dedbd0]">
              Don&apos;t have an account?{" "}
              <Link className="font-medium text-[#c97955] hover:text-[#e2916b]" href="/register">
                Sign up
              </Link>
            </p>

            <div className="my-6 flex items-center gap-3 text-xs text-[#d1cec2]">
              <span className="h-px flex-1 bg-[#5b5c56]" />
              Or sign in with
              <span className="h-px flex-1 bg-[#5b5c56]" />
            </div>

            <div className="flex justify-center gap-3">
              <button
                aria-label="Sign in with Google"
                className="grid size-10 place-items-center rounded-full border border-[#686962] text-[#f4cd62] transition hover:bg-[#43443f]"
                type="button"
              >
                <span className="text-base font-semibold">G</span>
              </button>
              <button
                aria-label="Sign in with Apple"
                className="grid size-10 place-items-center rounded-full border border-[#686962] text-[#f2f0e9] transition hover:bg-[#43443f]"
                type="button"
              >
                <Apple className="size-5 fill-current" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
