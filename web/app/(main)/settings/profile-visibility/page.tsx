"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Eye, Users, Lock, Loader2 } from "lucide-react";
import { useMe } from "@/tanstack/queries/auth.query";
import { useUpdatePrivacy } from "@/tanstack/queries/user.query";
import { enqueueSnackbar } from "notistack";
import { cn } from "@/lib/utils";

const visibilityOptions = [
  {
    id: "PUBLIC",
    title: "Public",
    description: "Anyone can find and view your profile details.",
    icon: <Eye className="h-4 w-4" />,
  },
  {
    id: "FRIENDS_ONLY",
    title: "Friends Only",
    description: "Only accepted friends can view your profile details.",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "PRIVATE",
    title: "Private",
    description: "No one else can see your profile. Your profile is entirely private.",
    icon: <Lock className="h-4 w-4" />,
  },
];

export default function ProfileVisibilityPage() {
  const router = useRouter();
  const { data: meResponse, isLoading: isUserLoading } = useMe();
  const { mutate: updatePrivacy, isPending: isUpdating } = useUpdatePrivacy();

  const user = meResponse?.data;
  const currentVisibility = user?.profileVisibility || "PUBLIC";

  const [selectedVisibility, setSelectedVisibility] = useState<string>(currentVisibility);

  useEffect(() => {
    if (currentVisibility) {
      setSelectedVisibility(currentVisibility);
    }
  }, [currentVisibility]);

  if (isUserLoading || !user) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-black text-foreground font-geist">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white" />
          <p className="text-xs tracking-widest uppercase text-muted-foreground animate-pulse font-semibold">Loading settings...</p>
        </div>
      </main>
    );
  }

  const handleSelect = (optionId: string) => {
    if (optionId === selectedVisibility) return;

    const previousValue = selectedVisibility;
    setSelectedVisibility(optionId);

    updatePrivacy(
      {
        profileVisibility: optionId,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Profile visibility updated successfully", { variant: "success" });
        },
        onError: (err: any) => {
          setSelectedVisibility(previousValue);
          enqueueSnackbar(err?.response?.data?.message || "Failed to update profile visibility", { variant: "error" });
        },
      }
    );
  };

  return (
    <main className="min-h-svh bg-black text-foreground font-geist px-4 py-8 md:py-12 flex justify-center items-start">
      <div className="w-full max-w-xl">
        {/* Back Link */}
        <Link href="/settings" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Settings</span>
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#eeece4]">Profile Visibility</h1>
          <p className="text-xs text-muted-foreground mt-1">Control who can discover and see your profile details.</p>
        </div>

        {/* Options List */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-xl divide-y divide-white/[0.04]">
          {visibilityOptions.map((option) => {
            const isSelected = option.id === selectedVisibility;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                disabled={isUpdating}
                className={cn(
                  "w-full flex items-start gap-4 px-6 py-5 text-left transition relative",
                  isSelected 
                    ? "bg-white/[0.01]" 
                    : "hover:bg-white/[0.02]"
                )}
              >
                {/* Icon wrapper */}
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
                  isSelected
                    ? "bg-white text-black border-white"
                    : "bg-black/50 text-muted-foreground border-white/[0.06]"
                )}>
                  {option.icon}
                </span>

                {/* Text Content */}
                <div className="min-w-0 flex-1 pr-6">
                  <span className="block text-[13px] font-semibold text-[#eeece4]">{option.title}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground leading-normal">{option.description}</span>
                </div>

                {/* Checkmark or Loader */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  {isSelected && (
                    isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Check className="h-4 w-4 text-white" />
                    )
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-4 px-4 text-[10px] text-muted-foreground/50 leading-relaxed text-center">
          Note: Changing your profile visibility does not restrict direct conversations you are already participating in.
        </p>
      </div>
    </main>
  );
}
