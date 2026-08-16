"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Volume2, MessageSquare, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SettingSidebar from "@/components/ui/settings-sidebar";
import { useMe } from "@/tanstack/queries/auth.query";
import { useUpdatePrivacy } from "@/tanstack/queries/user.query";
import { enqueueSnackbar } from "notistack";

const privacyOptions = [
  {
    id: "ALWAYS",
    title: "Always (when not in chat)",
    description: "Receive invitations anytime. If the chat is closed, we'll notify you with a popup toast.",
    icon: <Volume2 className="h-4 w-4" />,
  },
  {
    id: "CHAT_ONLY",
    title: "Only when Chat is Open",
    description: "Only receive invitations if you have the sender's chat thread actively open.",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "NEVER",
    title: "Never",
    description: "Block all incoming Listen Together requests.",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
];

export default function MusicPrivacyPage() {
  const { data: meResponse, isLoading: isUserLoading } = useMe();
  const { mutate: updatePrivacy, isPending: isUpdating } = useUpdatePrivacy();

  const user = meResponse?.data;
  const currentPreference = user?.listenTogetherPreference || "ALWAYS";

  const [selectedPrivacy, setSelectedPrivacy] = useState<string>(currentPreference);

  useEffect(() => {
    if (currentPreference) {
      setSelectedPrivacy(currentPreference);
    }
  }, [currentPreference]);

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
    if (optionId === selectedPrivacy) return;

    const previousValue = selectedPrivacy;
    setSelectedPrivacy(optionId);

    updatePrivacy(
      {
        listenTogetherPreference: optionId,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Music sync privacy updated successfully", { variant: "success" });
        },
        onError: (err: any) => {
          setSelectedPrivacy(previousValue);
          enqueueSnackbar(err?.response?.data?.message || "Failed to update music privacy", { variant: "error" });
        },
      }
    );
  };

  return (
    <div className="flex h-svh">
      <SettingSidebar 
        name="Music Sync Privacy" 
        navigateTo="Back to Settings" 
        path="/settings" 
        tagline="Manage who can invite you to Listen Together." 
      />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-12 lg:pb-12 xl:px-16 overflow-y-auto">
        <div className="mx-auto max-w-[620px] lg:max-w-[1024px] w-full">

          {/* Mobile Back Link */}
          <div className="mb-6 lg:hidden">
            <Link href="/settings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Settings</span>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/[0.06] bg-[#151517]/85 p-6 md:p-8 shadow-xl">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight text-[#eeece4]">Listen Together Invites</h2>
                <p className="text-xs text-muted-foreground mt-1">Configure your availability for synchronized music sessions.</p>
              </div>

              {/* Options List */}
              <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-black/40 shadow-inner divide-y divide-white/[0.04]">
                {privacyOptions.map((option) => {
                  const isSelected = option.id === selectedPrivacy;

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
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
