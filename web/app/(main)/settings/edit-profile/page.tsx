"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserRound, Mail, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useMe } from "@/tanstack/queries/auth.query";
import { useUpdateProfile } from "@/tanstack/queries/user.query";
import { enqueueSnackbar } from "notistack";
import Avatar from "@/components/ui/avatar";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: meResponse, isLoading: isUserLoading } = useMe();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const user = meResponse?.data;

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  if (isUserLoading || !user) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-black text-foreground font-geist">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white" />
          <p className="text-xs tracking-widest uppercase text-muted-foreground animate-pulse font-semibold">Loading profile...</p>
        </div>
      </main>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      enqueueSnackbar("Display name is required", { variant: "error" });
      return;
    }

    updateProfile(
      {
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        bio: bio.trim() || "",
        avatarUrl: avatarUrl.trim() || "",
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Profile updated successfully", { variant: "success" });
          router.push("/settings");
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.response?.data?.message || "Failed to update profile", { variant: "error" });
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
          <h1 className="text-2xl font-bold tracking-tight text-[#eeece4]">Edit Profile</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your public information and account email.</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/[0.06] bg-[#151517]/85 p-6 md:p-8 shadow-xl">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-white/[0.04]">
            <Avatar 
              compact={false} 
              user={{ 
                displayName: displayName || user.displayName, 
                avatarUrl: avatarUrl || user.avatarUrl 
              }} 
            />
            <span className="text-[11px] text-muted-foreground tracking-wider uppercase">Profile Avatar Preview</span>
          </div>

          <div className="space-y-5">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Display Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                </span>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/40 py-3.5 pl-11 pr-4 text-sm text-[#eeece4] placeholder-muted-foreground/40 focus:border-white/20 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/40 py-3.5 pl-11 pr-4 text-sm text-[#eeece4] placeholder-muted-foreground/40 focus:border-white/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Avatar URL Input */}
            <div className="space-y-1.5">
              <label htmlFor="avatarUrl" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                Avatar Image URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <input
                  id="avatarUrl"
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Paste image URL here"
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/40 py-3.5 pl-11 pr-4 text-sm text-[#eeece4] placeholder-muted-foreground/40 focus:border-white/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Bio Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label htmlFor="bio" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Bio
                </label>
                <span className="text-[10px] text-muted-foreground/50">{bio.length}/200</span>
              </div>
              <div className="relative">
                <span className="absolute top-4 left-4 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/40 py-3.5 pl-11 pr-4 text-sm text-[#eeece4] placeholder-muted-foreground/40 focus:border-white/20 focus:outline-none transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex gap-4">
            <Link
              href="/settings"
              className="flex-1 rounded-2xl border border-white/[0.08] bg-transparent py-3.5 text-center text-sm font-semibold text-[#eeece4] hover:bg-white/[0.02] transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-2xl bg-white py-3.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
