"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, Users, EyeOff, Clock, Loader2 } from "lucide-react";
import { useMe } from "@/tanstack/queries/auth.query";
import { useUpdatePrivacy } from "@/tanstack/queries/user.query";
import { enqueueSnackbar } from "notistack";
import { cn } from "@/lib/utils";
import Toggle from "@/components/ui/toggle";

const presenceOptions = [
  {
    id: "EVERYONE",
    title: "Everyone",
    description: "Anyone can see your online status when you are active.",
    icon: <Eye className="h-4 w-4" />,
  },
  {
    id: "FRIENDS_ONLY",
    title: "Friends Only",
    description: "Only accepted friends can see your online status.",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "NOBODY",
    title: "Nobody",
    description: "No one can see your online status.",
    icon: <EyeOff className="h-4 w-4" />,
  },
];

export default function PresenceSettingsPage() {
  const { data: meResponse, isLoading: isUserLoading } = useMe();
  const { mutate: updatePrivacy, isPending: isUpdating } = useUpdatePrivacy();

  const user = meResponse?.data;
  const currentPresence = user?.presenceVisibility || "FRIENDS_ONLY";
  const currentShowLastSeen = user?.showLastSeen ?? true;

  const [selectedPresence, setSelectedPresence] = useState<string>(currentPresence);
  const [selectedShowLastSeen, setSelectedShowLastSeen] = useState<boolean>(currentShowLastSeen);

  useEffect(() => {
    if (user) {
      setSelectedPresence(currentPresence);
      setSelectedShowLastSeen(currentShowLastSeen);
    }
  }, [currentPresence, currentShowLastSeen, user]);

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

  const handlePresenceSelect = (optionId: string) => {
    if (optionId === selectedPresence) return;

    const previousValue = selectedPresence;
    setSelectedPresence(optionId);

    updatePrivacy(
      {
        presenceVisibility: optionId,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Presence visibility updated successfully", { variant: "success" });
        },
        onError: (err: any) => {
          setSelectedPresence(previousValue);
          enqueueSnackbar(err?.response?.data?.message || "Failed to update presence visibility", { variant: "error" });
        },
      }
    );
  };

  const handleLastSeenToggle = (checked: boolean) => {
    const previousValue = selectedShowLastSeen;
    setSelectedShowLastSeen(checked);

    updatePrivacy(
      {
        showLastSeen: checked,
      },
      {
        onSuccess: () => {
          enqueueSnackbar(
            `Last seen status ${checked ? "enabled" : "disabled"} successfully`,
            { variant: "success" }
          );
        },
        onError: (err: any) => {
          setSelectedShowLastSeen(previousValue);
          enqueueSnackbar(err?.response?.data?.message || "Failed to update last seen status", { variant: "error" });
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
          <h1 className="text-2xl font-bold tracking-tight text-[#eeece4]">Presence & Last Seen</h1>
          <p className="text-xs text-muted-foreground mt-1">Control who can see your active online status and when you were last seen.</p>
        </div>

        {/* Section 1: Presence Visibility */}
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Online Status Visibility</h2>
          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-xl divide-y divide-white/[0.04]">
            {presenceOptions.map((option) => {
              const isSelected = option.id === selectedPresence;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handlePresenceSelect(option.id)}
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
        </div>

        {/* Section 2: Last Seen Toggle */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Last Seen Status</h2>
          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-xl px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/50 text-muted-foreground border border-white/[0.06]">
                <Clock className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[#eeece4]">Show Last Seen Time</span>
                <span className="mt-1 block text-[11px] text-muted-foreground leading-normal">
                  If turned off, others won't be able to see your last active time.
                </span>
              </div>
            </div>
            <Toggle 
              checked={selectedShowLastSeen} 
              onChange={handleLastSeenToggle} 
            />
          </div>
        </div>

        <p className="mt-6 px-4 text-[10px] text-muted-foreground/50 leading-relaxed text-center">
          Note: Disabling your last active status means you will also be unable to see the last active status of other users.
        </p>
      </div>
    </main>
  );
}
