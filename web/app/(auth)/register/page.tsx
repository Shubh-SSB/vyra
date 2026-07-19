"use client";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/tanstack/mutation/auth.mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useState } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "h-11 w-full rounded-full border bg-transparent px-11 pr-12 text-sm text-[#f1efe7] outline-none transition placeholder:text-[#aaa69a]";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      router.push("/login");
    } catch (err: any) {
      // Handle backend errors (e.g. "Username already exists")
      const message = err?.message || "Registration failed. Please try again.";

      if (message.toLowerCase().includes("username")) {
        setError("username", { message });
      } else if (message.toLowerCase().includes("email")) {
        setError("email", { message });
      } else {
        setError("root", { message });
      }
    }
  };

  return (
    <main className="max-h-screen">
      <div className="grid min-h-screen overflow-hidden lg:grid-cols-2 lg:border lg:border-[#5a584f]">
        <section className="relative hidden overflow-hidden lg:flex lg:min-h-full lg:items-center lg:px-24">
          <Image src="/login.png" alt="Login Background" width={720} height={960} className="absolute inset-0 h-full w-full object-cover" />
        </section>

        <section className="flex min-h-screen items-center justify-center bg-black px-6 py-12 lg:min-h-0 lg:px-10">
          <div className="w-full max-w-[360px] text-[#eeece4]">
            <div className="mb-7 text-center">
              <h1 className="font-serif text-4xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="mt-2 text-sm text-[#d1cec2]">
                A few details and you&apos;re ready to begin.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Display Name */}
              <div>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c1bcaa]" />
                  <input
                    {...register("displayName")}
                    aria-label="Full name"
                    className={cn(fieldBase, errors.displayName ? "border-red-400 focus:border-red-400" : "border-[#9e9a88] focus:border-[#c97955]")}
                    placeholder="Full Name"
                    type="text"
                  />
                </div>
                {errors.displayName && (
                  <p className="mt-1.5 pl-4 text-xs text-red-400">{errors.displayName.message}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c1bcaa]" />
                  <input
                    {...register("username")}
                    aria-label="Username"
                    className={cn(fieldBase, errors.username ? "border-red-400 focus:border-red-400" : "border-[#9e9a88] focus:border-[#c97955]")}
                    placeholder="Username"
                    type="text"
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1.5 pl-4 text-xs text-red-400">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c1bcaa]" />
                  <input
                    {...register("email")}
                    aria-label="Email address"
                    className={cn(fieldBase, errors.email ? "border-red-400 focus:border-red-400" : "border-[#9e9a88] focus:border-[#c97955]")}
                    placeholder="Email Address (optional)"
                    type="email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 pl-4 text-xs text-red-400">{errors.email.message}</p>
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
                    placeholder="Create Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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

              {/* Root / server error */}
              {errors.root && (
                <p className="text-center text-xs text-red-400">{errors.root.message}</p>
              )}

              <button
                className="!mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#c97955] text-sm font-medium text-[#fff8ed] transition hover:bg-[#db8962] disabled:opacity-50"
                type="submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating..." : "Create account"}{" "}
                <ArrowRight className="size-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#dedbd0]">
              Already have an account?{" "}
              <Link className="font-medium text-[#c97955] hover:text-[#e2916b]" href="/login">
                Sign in
              </Link>
            </p>

            <div className="my-6 flex items-center gap-3 text-xs text-[#d1cec2]">
              <span className="h-px flex-1 bg-[#5b5c56]" />
              Or sign up with
              <span className="h-px flex-1 bg-[#5b5c56]" />
            </div>

            <div className="flex justify-center gap-3">
              <button
                aria-label="Sign up with Google"
                className="grid size-10 place-items-center rounded-full border border-[#686962] text-[#f4cd62] transition hover:bg-[#43443f]"
                type="button"
              >
                <span className="text-base font-semibold">G</span>
              </button>
              <button
                aria-label="Sign up with Apple"
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
