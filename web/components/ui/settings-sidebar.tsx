import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import ProfileCard from "./profile-card";

export default function SettingSidebar({ name, tagline, navigateTo, path }: { name: string, tagline?: string, navigateTo?: string, path?: string }) {

    return (
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
            {path && (
                <Link href={path} className="mb-9 flex items-center justify-center hover:text-white/55 bg-white/5 p-3 backdrop-blur-md rounded-2xl gap-3">
                    <ArrowLeft />
                    <span className="text-md tracking-tight">{navigateTo}</span>
                </Link>
            )}
            <div className="mb-8 hidden items-center justify-between gap-5 md:flex md:flex-col">
                <div className="text-start flex-1 w-full">
                    <h1 className="font-display text-[30px] my-3 font-semibold tracking-[-0.045em] sm:text-[34px]">{name}</h1>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">{tagline}</p>
                </div>

            </div>
            <div><button
                type="button"
                // onClick={() => showNotice("Upgrade to Premium")}
                className="flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-black shadow-lg transition hover:bg-white hover:scale-105 active:scale-95"
            >
                <Sparkles className="h-3.5 w-3.5 fill-black stroke-none" />
                Upgrade
            </button></div>
            <ProfileCard />
        </aside>
    )
}