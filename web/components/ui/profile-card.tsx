"use client";

import React from 'react'
import Avatar from './avatar'
import { LogOut } from 'lucide-react'
import { useMe } from '@/tanstack/queries/auth.query'
import { useLogoutMutation } from '@/tanstack/mutation/auth.mutation'

const ProfileCard = () => {
    const { data: meResponse, isLoading } = useMe();
    const { mutate: logout } = useLogoutMutation();

    const user = meResponse?.data;

    if (isLoading || !user) {
        return (
            <div className="mt-auto rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-20 bg-white/10 rounded" />
                        <div className="h-2 w-12 bg-white/10 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-auto rounded-2xl border backdrop-blur-md border-white/[0.08] bg-white/[0.035] p-3.5">
            <div className="flex items-center gap-3">
                <Avatar compact user={user} />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#eeece4]">{user.displayName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">@{user.username}</p>
                </div>
                <button
                    type="button"
                    aria-label="Sign out"
                    onClick={() => logout()}
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground active:scale-95"
                >
                    <LogOut className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

export default ProfileCard