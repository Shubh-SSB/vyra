"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export default function MailAnimation({
    className,
    size = 100,
    scale = 1.6
}: {
    className?: string;
    size?: number;
    scale?: number;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load the dotLottie web component player script if not already registered
        if (typeof window !== "undefined" && !window.customElements.get("dotlottie-player")) {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
            script.type = "module";
            document.head.appendChild(script);
        }
    }, []);

    if (!mounted) {
        return <div style={{ width: size, height: size }} className={className} />;
    }

    return (
        <div style={{ width: size, height: size }} className={cn("relative flex items-center justify-center overflow-visible", className)}>
            <div style={{ transform: `scale(${scale})`, width: "100%", height: "100%" }} className="absolute flex items-center justify-center">
                {/* @ts-ignore */}
                <dotlottie-player
                    src="https://assets-v2.lottiefiles.com/a/945f4a06-1151-11ee-9fc5-f7ef579f9703/9b1tQsDWMt.lottie"
                    background="transparent"
                    speed="2"
                    // loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
}
