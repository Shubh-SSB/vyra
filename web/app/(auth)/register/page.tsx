"use client";
import Link from "next/link";
import {
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
import { VyraMark } from "@/components/vyra/logo";

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
    <main className="min-h-screen w-full font-geist">
      <div className="grid min-h-screen lg:overflow-hidden lg:grid-cols-2 lg:border lg:border-[#5a584f]">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-16 lg:min-h-full">
          {/* Subtle branding at top */}
          <div className="relative z-10 flex items-center gap-2.5">
            <VyraMark className="bg-[#eeece4] text-[#0A0A0A]" />
            <span className="font-geist text-[19px] font-semibold tracking-wider text-[#eeece4]">
              VYRA
            </span>
          </div>

          {/* Main logo / text & tagline at bottom */}
          <div className="relative z-10 mt-auto">
            <h1 className="font-geist text-7xl font-bold tracking-tight text-[#eeece4] mb-4">
              VYRA
            </h1>
            <p className="text-lg text-[#d1cec2] font-medium leading-relaxed max-w-sm">
              Conversations are temporary. Knowledge is permanent.
            </p>
          </div>

          <Image
            src="/bg-2.jpeg"
            alt="Login Background"
            width={720}
            height={960}
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0 lg:px-10 overflow-y-auto w-full">
          <div className="w-full max-w-[360px] text-[#eeece4]">
            <div className="mb-7 text-center">
              <h1 className="text-4xl font-semibold tracking-tight">
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
                    placeholder="Email Address"
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
                <svg className="size-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.26v3.15C3.25 21.32 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.32 14.37c-.24-.72-.38-1.49-.38-2.37s.14-1.65.38-2.37V6.48H1.26C.46 8.09 0 9.98 0 12s.46 3.91 1.26 5.52l4.06-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.68 1.26 6.48l4.06 3.15c.94-2.83 3.57-4.93 6.68-4.93z" />
                </svg>
              </button>
              <button
                aria-label="Sign up with Apple"
                className="grid size-10 place-items-center rounded-full border border-[#686962] text-[#f2f0e9] transition hover:bg-[#43443f]"
                type="button"
              >
                <svg className="size-5" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.03-7.65-7.85-11.89-14.45-6.52-10.33-11.52-21.78-15.01-34.37-3.49-12.59-5.23-24.31-5.23-35.15 0-14.39 3.63-26.04 10.89-34.95 7.27-8.91 16.59-13.43 27.97-13.56 4.9 0 10.22 1.26 15.96 3.79 5.75 2.53 9.77 3.79 12.06 3.79 1.96 0 6.13-1.35 12.52-4.05 6.39-2.71 11.96-3.95 16.71-3.73 13.25.76 23.63 5.48 31.14 14.16-11.69 7.08-17.47 16.94-17.34 29.58.13 10.11 3.92 18.51 11.38 25.19 7.46 6.68 16.34 10.19 26.65 10.53-1.63 7.82-3.95 15.9-6.96 24.23zM119.22 31.39c0-7.39 2.62-14.22 7.85-20.49 5.23-6.27 11.89-10.11 19.98-11.52.13.76.2 1.55.2 2.37 0 7.39-2.72 14.35-8.15 20.89-5.43 6.54-12.22 10.45-20.38 11.72-.26-.98-.38-2.06-.3-3.25z" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
