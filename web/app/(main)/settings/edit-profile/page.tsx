"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, UserRound, Mail, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useMe } from "@/tanstack/queries/auth.query";
import { useUpdateProfile } from "@/tanstack/queries/user.query";
import { useSnackbar } from "notistack";
import Avatar from "@/components/ui/avatar";
import SettingSidebar from "@/components/ui/settings-sidebar";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";

export default function EditProfilePage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data: meResponse, isLoading: isUserLoading } = useMe();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const user = meResponse?.data;

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      enqueueSnackbar("Please upload an image file", { variant: "error" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar("Image size should be less than 2MB", { variant: "error" });
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(objectUrl);
    enqueueSnackbar("Avatar updated in preview", { variant: "success" });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setAvatarPreviewUrl("");
      setSelectedFile(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      enqueueSnackbar("Display name is required", { variant: "error" });
      return;
    }

    let finalAvatarUrl = avatarUrl;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const fileExt = selectedFile.name.split(".").pop() || "jpg";
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        const contentType = selectedFile.type;

        // 1. Get Presigned URL for avatars folder
        const response = await api.post("/attachments/presigned-url", {
          fileName,
          contentType,
          folder: "avatars",
        });

        const { uploadUrl, fileUrl } = response.data.data;

        // 2. Upload file directly to object store
        await fetch(uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": contentType,
          },
        });

        finalAvatarUrl = fileUrl;
      } catch (err: any) {
        console.error("Failed to upload avatar", err);
        enqueueSnackbar("Failed to upload avatar image to storage", { variant: "error" });
        setIsUploading(false);
        return;
      }
    }

    updateProfile(
      {
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        bio: bio.trim() || "",
        avatarUrl: finalAvatarUrl,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Profile updated successfully", { variant: "success" });
          setIsUploading(false);
          router.push("/settings");
        },
        onError: (err: any) => {
          enqueueSnackbar(err?.response?.data?.message || "Failed to update profile", { variant: "error" });
          setIsUploading(false);
        },
      }
    );
  };

  const initials = displayName
    ? displayName.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="flex h-svh">
      <SettingSidebar name="Edit Profile" navigateTo="Back to Settings" path="/settings" tagline="This page will help you update the current user's basic settings." />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-12 lg:pb-12 xl:px-16 overflow-y-auto">
        <div className="mx-auto max-w-[620px] lg:max-w-[1024px] w-full">

          {/* Mobile Back Link */}
          <div className="mb-6 lg:hidden">
            <Link href="/settings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Settings</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">

              {/* Left Side: Avatar Upload */}
              <div className="rounded-3xl border border-white/[0.06] bg-[#151517]/85 p-6 md:p-8 shadow-xl flex flex-col items-center justify-center gap-6 min-h-[350px]">
                <div className="text-center w-full">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Profile Avatar</h3>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">Drag and drop or click to upload</p>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("avatar-input")?.click()}
                  className={cn(
                    "relative w-44 h-44 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group shadow-inner",
                    isDragging
                      ? "border-white bg-white/[0.06] scale-[1.03]"
                      : "border-white/[0.12] hover:border-white/30 hover:bg-white/[0.02]"
                  )}
                >
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {(avatarPreviewUrl || avatarUrl) ? (
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src={avatarPreviewUrl || avatarUrl}
                        alt="Avatar preview"
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="h-5 w-5 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-4 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-indigo-500 p-[2px] shadow-inner text-2xl font-display font-bold text-foreground">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#151517]">
                          {initials}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-[#eeece4] block">Drop Image Here</span>
                        <span className="text-[9px] text-muted-foreground/50 block mt-0.5">or browse files</span>
                      </div>
                    </div>
                  )}
                </div>

                {(avatarPreviewUrl || avatarUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl("");
                      setAvatarPreviewUrl("");
                      setSelectedFile(null);
                      enqueueSnackbar("Avatar removed from preview", { variant: "info" });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold transition hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Right Side: Profile Details */}
              <div className="rounded-3xl border border-white/[0.06] bg-[#151517]/85 p-6 md:p-8 shadow-xl flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="text-start">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Personal Details</h3>
                    <p className="text-[11px] text-muted-foreground/50 mt-1">Configure your personal information and bio</p>
                  </div>

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

                {/* Actions */}
                <div className="pt-4 flex gap-4 border-t border-white/[0.04]">
                  <Link
                    href="/settings"
                    className="flex-1 rounded-2xl border border-white/[0.08] bg-transparent py-3.5 text-center text-sm font-semibold text-[#eeece4] hover:bg-white/[0.02] transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="flex-1 rounded-2xl bg-white py-3.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {(isSaving || isUploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
