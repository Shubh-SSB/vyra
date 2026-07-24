"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CircleHelp,
  Eye,
  Fingerprint,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  UsersRound,
  QrCode,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/avatar";
import ProfileCard from "@/components/ui/profile-card";
import { useMe } from "@/tanstack/queries/auth.query";
import { useUpdatePrivacy } from "@/tanstack/queries/user.query";
import { enqueueSnackbar } from "notistack";
import Image from "next/image";
import SettingsToggle from "@/components/ui/settings-toggle";

type SectionId = "account" | "security" | "preferences" | "privacy";

const navigation: Array<{ id: SectionId; label: string; icon: ReactNode }> = [
  { id: "account", label: "Account", icon: <UserRound className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "preferences", label: "Preferences", icon: <Palette className="h-4 w-4" /> },
  { id: "privacy", label: "Privacy", icon: <Eye className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const { data: meResponse, isLoading: isUserLoading } = useMe();
  const { mutate: updatePrivacy } = useUpdatePrivacy();
  const [activeSection, setActiveSection] = useState<SectionId>("account");
  const [autofill, setAutofill] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [notice, setNotice] = useState("");

  const selectSection = (section: SectionId) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showNotice = (label: string) => {
    setNotice(`${label} is ready to configure.`);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const user = meResponse?.data;

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

  return (
    <main className="min-h-svh overflow-x-hidden text-foreground font-geist">


      <div className="relative z-10 mx-auto flex w-full">
        {/* Desktop Sidebar aside */}
        <aside className="sticky top-0 hidden h-svh w-[320px] rounded-tr-2xl shrink-0 flex-col border-r border-white/5 px-5 py-6 lg:flex">
          {/* <Image
            src="/bg1.jpeg"
            alt="Tile background"
            fill
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105 -z-10 opacity-30 rounded-tr-2xl"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" /> */}
          <Link href="/chat" className="mb-9 flex items-center justify-center hover:text-white/55 bg-white/5 p-3 backdrop-blur-md rounded-2xl gap-3">
            <ArrowLeft />
            <span className="text-md tracking-tight">Back to Conversations</span>
          </Link>
          <div className="mb-8 hidden items-center justify-between gap-5 md:flex">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">Personal space</p>
              <h1 className="font-display text-[30px] font-semibold tracking-[-0.045em] sm:text-[34px]">Settings</h1>
            </div>
            <button
              type="button"
              onClick={() => showNotice("Upgrade to Premium")}
              className="flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-black shadow-lg transition hover:bg-white hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 fill-black stroke-none" />
              Upgrade
            </button>
          </div>

          <ProfileCard />
        </aside>

        {/* Content Area */}
        <section className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-12 lg:pb-12 xl:px-16">
          <div className="mx-auto max-w-[620px] lg:max-w-[1024px]">
            {/* Desktop header row */}


            {/* Notification banner */}
            <div aria-live="polite" className="pointer-events-none fixed left-1/2 top-20 z-30 -translate-x-1/2">
              {notice && (
                <div className="rounded-full border border-white/[0.12] bg-[#1b1b1d] px-4 py-2 text-[12px] text-foreground shadow-2xl">
                  {notice}
                </div>
              )}
            </div>

            {/* Sections Flow */}
            <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              {/* Account Section */}
              <SettingsPanel id="account">
                <PanelHeading title="Account" />
                <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg divide-y divide-white/[0.04]">
                  {/* Row 1: Profile details */}
                  <Link
                    href="/settings/edit-profile"
                    className="flex w-full items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar compact user={user} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[14px] text-[#eeece4]">{user.displayName}</p>
                          <span className="rounded bg-white/[0.09] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground">YOU</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {user.email || `@${user.username}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  {/* Row 2: Sign in on another Device */}
                  <SettingsRow
                    icon={<QrCode />}
                    title="Sign in on another Device"
                    onClick={() => showNotice("Device linkage")}
                  />

                  {/* Row 3: Email Address */}
                  <SettingsRow
                    icon={<Mail />}
                    title="Email address"
                    description="Verified"
                    onClick={() => showNotice("Email address")}
                  />

                  <SettingsRow
                    icon={<Moon />}
                    title="Quiet hours"
                    description="No interruptions from 10 PM to 8 AM"
                    onClick={() => showNotice("Quiet hours")}
                  />
                </div>
              </SettingsPanel>

              {/* Security Section */}
              <SettingsPanel id="security">
                <PanelHeading title="Security" />
                <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg divide-y divide-white/[0.04]">
                  {/* <SettingsRow
                    icon={<LockKeyhole />}
                    title="Lock with"
                    description="None"
                    onClick={() => showNotice("Lock settings")}
                  /> */}

                  {/* <div>
                    <SettingsToggle
                      icon={<Clock />}
                      title="Autofill"
                      checked={autofill}
                      onChange={setAutofill}
                    />
                    <p className="px-5 pb-4 text-[11px] text-muted-foreground leading-relaxed">
                      Automatically fill in your usernames and passwords.
                    </p>
                  </div> */}

                  {/* Row 3: Screen lock */}
                  <SettingsRow
                    icon={<LockKeyhole />}
                    title="Screen lock"
                    description="Required after 5 minutes"
                    onClick={() => showNotice("Screen lock")}
                  />
                  <SettingsRow
                    icon={<UsersRound />}
                    title="Connected accounts"
                    description="Manage sign-in methods"
                    onClick={() => showNotice("Connected accounts")}
                  />

                  {/* Row 4: Passkeys */}
                  <SettingsRow
                    icon={<Fingerprint />}
                    title="Passkeys"
                    description="Use your device to sign in"
                    onClick={() => showNotice("Passkeys")}
                  />

                  {/* Row 5: Active sessions */}
                  <SettingsRow
                    icon={<Smartphone />}
                    title="Active sessions"
                    description="2 trusted devices"
                    onClick={() => showNotice("Active sessions")}
                  />
                </div>
              </SettingsPanel>

              {/* Privacy Section */}
              <SettingsPanel id="privacy">
                <PanelHeading title="Privacy" />
                <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg divide-y divide-white/[0.04]">
                  {/* Row 1: Read receipts */}
                  <SettingsToggle
                    icon={<Eye />}
                    title="Read receipts"
                    description="Let others know when you’ve seen a message"
                    checked={user.showReadReceipts ?? true}
                    onChange={(checked) => {
                      updatePrivacy({ showReadReceipts: checked }, {
                        onSuccess: () => {
                          enqueueSnackbar(`Read receipts ${checked ? 'enabled' : 'disabled'}`, { variant: "success" });
                        },
                        onError: (err: any) => {
                          enqueueSnackbar(err?.response?.data?.message || "Failed to update read receipts", { variant: "error" });
                        }
                      });
                    }}
                  />

                  {/* Row 2: Quiet hours */}


                  {/* Row 3: Profile visibility */}
                  <SettingsRow
                    icon={<UsersRound />}
                    title="Profile visibility"
                    description={user.profileVisibility ? `Visible to ${user.profileVisibility.toLowerCase().replace('_', ' ')}` : "Visible to connections"}
                    href="/settings/profile-visibility"
                  />

                  {/* Row 4: Message privacy */}
                  <SettingsRow
                    icon={<MessageSquare />}
                    title="Message privacy"
                    description={user.messagePrivacy ? `Allowed by ${user.messagePrivacy.toLowerCase().replace('_', ' ')}` : "Allowed by everyone"}
                    href="/settings/message-privacy"
                  />

                  {/* Row 5: Presence & last active */}
                  <SettingsRow
                    icon={<Clock />}
                    title="Presence & last active"
                    description={user.presenceVisibility ? `Visible to ${user.presenceVisibility.toLowerCase().replace('_', ' ')}` : "Visible to connections"}
                    href="/settings/presence"
                  />
                </div>
              </SettingsPanel>

              <SettingsPanel id="preferences">
                <PanelHeading title="Preferences" />
                <div className="mt-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg divide-y divide-white/[0.04]">
                  {/* Row 1: Quick fill */}
                  <SettingsToggle
                    icon={<KeyRound />}
                    title="Quick fill"
                    description="Suggest details you use often"
                    checked={autofill}
                    onChange={setAutofill}
                  />

                  {/* Row 2: Message previews */}
                  <SettingsToggle
                    icon={<Bell />}
                    title="Message previews"
                    description="Show content in notifications"
                    checked={messagePreview}
                    onChange={setMessagePreview}
                  />

                  {/* Row 3: Appearance */}
                  <SettingsRow
                    icon={<Monitor />}
                    title="Appearance"
                    description="System dark"
                    onClick={() => showNotice("Appearance")}
                  />

                  <SettingsRow
                    icon={<Laptop />}
                    title="Data & storage"
                    description="Manage local data"
                    onClick={() => showNotice("Data & storage")}
                  />
                </div>

              </SettingsPanel>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Pill Bottom Navigation for Mobile */}
      <nav aria-label="Mobile settings sections" className="fixed inset-x-0 bottom-6 z-30 lg:hidden flex justify-center px-4">
        <div className="flex items-center justify-around gap-2.5 rounded-full border border-white/10 bg-black/80 backdrop-blur-lg px-6 py-2 shadow-2xl">
          {navigation.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectSection(item.id)}
                className={cn(
                  "flex h-11 w-11 flex-col items-center justify-center rounded-full transition-all duration-200",
                  isActive
                    ? "bg-white text-black scale-105 shadow-[0_4px_12px_rgba(255,255,255,0.25)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={item.label}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function PanelHeading({ title }: { title: string }) {
  return (
    <div className="px-1">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">{title}</h2>
    </div>
  );
}

function SettingsPanel({ id, className, children }: { id: SectionId; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("scroll-mt-8", className)}>
      {children}
    </section>
  );
}

function SettingsRow({ icon, title, description, onClick, href }: { icon: ReactNode; title: string; description?: string; onClick?: () => void; href?: string }) {
  const content = (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/50 text-muted-foreground border border-white/[0.06] transition group-hover:text-foreground group-hover:bg-black/70">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[#eeece4] truncate">{title}</span>
        {description && (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );

  const className = "group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.02]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground ml-2" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {content}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground ml-2" />
    </button>
  );
}



