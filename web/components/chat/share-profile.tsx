"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Share2, Check, Pin, PinOff, Sparkles } from "lucide-react";

export type SharePlatform = "instagram" | "whatsapp" | "share" | "pin";

type ShareProfileButtonProps = {
    username?: string;
    displayName?: string;
    profileUrl?: string;
    label?: string;
    className?: string;
    isPinned?: boolean;
    onShare?: (platform: SharePlatform) => void | Promise<void>;
};

const ShareProfileButton = ({
    username,
    displayName,
    profileUrl,
    label = "Share Profile",
    className,
    isPinned = false,
    onShare,
}: ShareProfileButtonProps) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"copy" | "pin">("copy");
    const [isPinningAnim, setIsPinningAnim] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getShareUrl = () => {
        if (profileUrl) return profileUrl;
        if (typeof window !== "undefined") {
            const base = window.location.origin;
            return username ? `${base}/profile/${username}` : window.location.href;
        }
        return "";
    };

    const copyToClipboard = async (message = "Link copied!") => {
        setToastType("copy");
        try {
            const url = getShareUrl();
            if (navigator?.clipboard) {
                await navigator.clipboard.writeText(url);
                showToast(message);
            }
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 2200);
    };

    const handlePlatformShare = async (platform: SharePlatform) => {
        const url = getShareUrl();
        const text = `Check out ${displayName || username || "this"}'s profile on VYRA!`;

        if (platform === "whatsapp") {
            onShare?.(platform);
            window.open(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(text + "\n" + url)}`,
                "_blank"
            );
        } else if (platform === "instagram") {
            onShare?.(platform);
            await copyToClipboard("Copied for Instagram!");
        } else if (platform === "share") {
            onShare?.(platform);
            if (typeof navigator !== "undefined" && navigator.share) {
                try {
                    await navigator.share({
                        title: `${displayName || username || "User"}'s Profile on VYRA`,
                        text: text,
                        url: url,
                    });
                } catch {
                    await copyToClipboard("Link copied!");
                }
            } else {
                await copyToClipboard("Link copied!");
            }
        } else if (platform === "pin") {
            const nextPinned = !isPinned;
            setIsPinningAnim(true);
            setToastType("pin");
            setTimeout(() => setIsPinningAnim(false), 950);
            await onShare?.("pin");
            showToast(nextPinned ? "Chat pinned to top!" : "Chat unpinned");
        }
    };

    return (
        <StyledWrapper className={className}>
            <div
                className={`share-container ${isOpen ? "open" : ""}`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                {/* Base Trigger Button (Positioned at Center Hub) */}
                <button
                    type="button"
                    className={`base-button ${isOpen ? "active" : ""}`}
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-expanded={isOpen}
                    aria-label={label}
                    title={isOpen ? undefined : label}
                >
                    <Share2 className="share-icon" size={20} />
                </button>

                {/* Circular Share Menu Open Directly Around the Button */}
                <div className={`menu-popup ${isOpen ? "open" : ""}`}>
                    <div className="main">
                        <div className="up">
                            {/* Card 1: Share with Instagram */}
                            <button
                                type="button"
                                className="card1"
                                title="Share with Instagram"
                                onClick={() => handlePlatformShare("instagram")}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="4 4 24 24"
                                    width="30px"
                                    height="30px"
                                    fillRule="nonzero"
                                    className="instagram"
                                >
                                    <path d="M11.46875,5c-3.55078,0 -6.46875,2.91406 -6.46875,6.46875v9.0625c0,3.55078 2.91406,6.46875 6.46875,6.46875h9.0625c3.55078,0 6.46875,-2.91406 6.46875,-6.46875v-9.0625c0,-3.55078 -2.91406,-6.46875 -6.46875,-6.46875zM11.46875,7h9.0625c2.47266,0 4.46875,1.99609 4.46875,4.46875v9.0625c0,2.47266 -1.99609,4.46875 -4.46875,4.46875h-9.0625c-2.47266,0 -4.46875,-1.99609 -4.46875,-4.46875v-9.0625c0,-2.47266 1.99609,-4.46875 4.46875,-4.46875zM21.90625,9.1875c-0.50391,0 -0.90625,0.40234 -0.90625,0.90625c0,0.50391 0.40234,0.90625 0.90625,0.90625c0.50391,0 0.90625,-0.40234 0.90625,-0.90625c0,-0.50391 -0.40234,-0.90625 -0.90625,-0.90625zM16,10c-3.30078,0 -6,2.69922 -6,6c0,3.30078 2.69922,6 6,6c3.30078,0 6,-2.69922 6,-6c0,-3.30078 -2.69922,-6 -6,-6zM16,12c2.22266,0 4,1.77734 4,4c0,2.22266 -1.77734,4 -4,4c-2.22266,0 -4,-1.77734 -4,-4c0,-2.22266 1.77734,-4 4,-4z" />
                                </svg>
                            </button>

                            {/* Card 2: Share with WhatsApp */}
                            <button
                                type="button"
                                className="card2"
                                title="Share with WhatsApp"
                                onClick={() => handlePlatformShare("whatsapp")}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 48 48"
                                    width="30px"
                                    height="30px"
                                    className="whatsapp"
                                >
                                    <path d="M41.7 6.3C37 1.6 30.7 0 24.1 0 11 0 0.3 10.7 0.3 23.8c0 4.2 1.1 8.3 3.2 11.9L0 48l12.6-3.3c3.5 1.9 7.4 2.9 11.5 2.9h0c13.1 0 23.8-10.7 23.8-23.8 0-6.4-2.5-12.5-6.2-17.5zM24.1 43.6c-3.6 0-7.1-1-10.1-2.8l-0.7-0.4-7.5 2 2-7.3-0.5-0.7c-2-3.1-3-6.8-3-10.6 0-10.9 8.9-19.8 19.8-19.8 5.3 0 10.3 2.1 14 5.8 3.7 3.7 5.8 8.7 5.8 14 0 10.9-8.9 19.8-19.8 19.8zm10.9-14.8c-0.6-0.3-3.6-1.8-4.1-2s-1-0.3-1.4 0.3c-0.4 0.6-1.7 2-2 2.5-0.4 0.4-0.7 0.5-1.3 0.2-0.6-0.3-2.5-0.9-4.8-2.9-1.8-1.6-3-3.5-3.3-4.1-0.4-0.6 0-0.9 0.3-1.2 0.3-0.3 0.6-0.7 0.9-1.1 0.3-0.4 0.4-0.6 0.6-1 0.2-0.4 0.1-0.7-0.1-1-0.1-0.3-1.4-3.4-1.9-4.6-0.5-1.2-1-1-1.4-1h-1.2c-0.4 0-1.1 0.1-1.7 0.8s-2.3 2.2-2.3 5.4c0 3.2 2.3 6.3 2.7 6.7 0.3 0.4 4.6 7 11.2 9.8 1.6 0.7 2.8 1.1 3.7 1.4 1.6 0.5 3 0.4 4.2 0.3 1.3-0.2 3.6-1.5 4.1-2.9 0.5-1.4 0.5-2.6 0.4-2.9-0.2-0.2-0.6-0.4-1.2-0.7z" />
                                </svg>
                            </button>
                        </div>

                        <div className="down">
                            {/* Card 3: Share (Native / Copy Link) */}
                            <button
                                type="button"
                                className="card3"
                                title="Share"
                                onClick={() => handlePlatformShare("share")}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="30px"
                                    height="30px"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="share-icon-btn"
                                >
                                    <circle cx="18" cy="5" r="3" />
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="19" r="3" />
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                </svg>
                            </button>

                            {/* Card 4: Pin / Unpin Chat */}
                            <button
                                type="button"
                                className={`card4 ${isPinned ? "is-pinned" : ""} ${isPinningAnim ? "pinning-impact" : ""}`}
                                title={isPinned ? "Unpin Chat" : "Pin Chat to Top"}
                                onClick={() => handlePlatformShare("pin")}
                            >
                                {isPinned ? (
                                    <PinOff size={24} className="pin-icon-btn unpin-icon" />
                                ) : (
                                    <Pin size={24} className="pin-icon-btn -rotate-45" />
                                )}

                                {isPinningAnim && (
                                    <>
                                        <span className="pin-shockwave" />
                                        <span className="spark spark-1" />
                                        <span className="spark spark-2" />
                                        <span className="spark spark-3" />
                                        <span className="spark spark-4" />
                                        <span className="spark spark-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {toastMessage && (
                        <div className={`copied-pill ${toastType === "pin" ? "pin-toast" : ""}`}>
                            {toastType === "pin" ? (
                                <>
                                    {toastMessage.includes("unpinned") ? (
                                        <PinOff size={13} className="text-amber-400" />
                                    ) : (
                                        <Pin size={13} className="fill-amber-400 text-amber-400 -rotate-45" />
                                    )}
                                    <span>{toastMessage}</span>
                                    <Sparkles size={12} className="text-amber-300" />
                                </>
                            ) : (
                                <>
                                    <Check size={12} />
                                    <span>{toastMessage}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  position: relative;
  display: inline-block;

  .share-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    isolation: isolate;
    z-index: 10;
  }

  .share-container.open {
    z-index: 40;
  }

  /* Base Trigger Button (Positioned at Center Hub) */
  .base-button {
    position: relative;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    width: 46px;
    border-radius: 9999px;
    background: radial-gradient(circle at 35% 35%, #222228 0%, #101013 100%);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    color: #e5e5e7;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    outline: none;
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      top: 2px;
      left: 7px;
      right: 7px;
      height: 36%;
      border-radius: 9999px 9999px 50% 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%);
      pointer-events: none;
    }

    &:hover {
      background: radial-gradient(circle at 35% 35%, #2a2a32 0%, #141418 100%);
      border-color: rgba(255, 255, 255, 0.35);
      color: #ffffff;
      transform: scale(1.04);
    }

    &:active {
      transform: scale(0.96);
    }

    .share-icon {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
    }

    &.active {
      background: radial-gradient(circle at 35% 35%, #18181d 0%, #070709 100%);
      border-color: rgba(255, 255, 255, 0.32);
      box-shadow: 0 0 0 4px #070709, 0 0 0 5.5px rgba(255, 255, 255, 0.16), 0 10px 28px rgba(0, 0, 0, 0.85);

      .share-icon {
        transform: rotate(15deg);
        color: #f3f3f5;
      }
    }
  }

  /* Circular Menu Centered Exactly Around the Base Button (Spin Open Animation) */
  .menu-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-140deg) scale(0.15);
    transform-origin: center center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.26s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 30;
    filter: drop-shadow(0 22px 48px rgba(0, 0, 0, 0.9)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.72));
    will-change: transform, opacity;

    &::before {
      content: "";
      position: absolute;
      inset: -8px;
      border-radius: 9999px;
      background: radial-gradient(circle, rgba(0, 0, 0, 0.52) 40%, rgba(0, 0, 0, 0.18) 72%, transparent 100%);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      z-index: -1;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.28s ease;
    }

    &.open::before {
      opacity: 1;
    }
  }

  .menu-popup.open {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Floating Toast Notification Pill */
  .copied-pill {
    position: absolute;
    bottom: calc(100% + 12px);
    left: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 9999px;
    background: rgba(15, 15, 18, 0.94);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #4ade80;
    font-size: 11px;
    font-weight: 600;
    pointer-events: none;
    animation: fadeInPill 0.2s ease-out forwards;
    white-space: nowrap;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    z-index: 50;
  }

  @keyframes fadeInPill {
    from {
      opacity: 0;
      transform: translate(-50%, 6px) scale(0.92);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
    }
  }

  /* 2x2 Grid for Petal Cards (Masks background underneath) */
  .main {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 6px;
    border-radius: 9999px;
    background: rgba(8, 8, 11, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9), 0 8px 24px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.14);
  }

  .up,
  .down {
    display: flex;
    flex-direction: row;
    gap: 7px;
  }

  /* Individual Platform Quadrant Cards */
  .card1,
  .card2,
  .card3,
  .card4 {
    width: 78px;
    height: 78px;
    outline: none;
    border: 1px solid rgba(255, 255, 255, 0.6);
    background: linear-gradient(150deg, #ffffff 0%, #f4f4f7 100%);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1.5px #ffffff;
  }

  /* Card 1: Top-Left (Instagram) */
  .card1 {
    border-radius: 78px 9px 20px 9px;
    transform-origin: bottom right;
  }

  .instagram {
    fill: #cc39a4;
    transition: fill 0.2s ease, transform 0.2s ease;
  }

  /* Card 2: Top-Right (WhatsApp) */
  .card2 {
    border-radius: 9px 78px 9px 20px;
    transform-origin: bottom left;
  }

  .whatsapp {
    fill: #25d366;
    transition: fill 0.2s ease, transform 0.2s ease;
  }

  /* Card 3: Bottom-Left (Share) */
  .card3 {
    border-radius: 9px 20px 9px 78px;
    transform-origin: top right;
  }

  .share-icon-btn {
    color: #0284c7;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  /* Card 4: Bottom-Right (Pin Profile) */
  .card4 {
    border-radius: 20px 9px 78px 9px;
    transform-origin: top left;
  }

  .pin-icon-btn {
    color: #f59e0b;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  /* Hover Effects: Each quadrant card blossoms outward away from the center button */
  .card1:hover {
    transform: scale(1.06);
    background: #cc39a4;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 20px rgba(204, 57, 164, 0.45);
    z-index: 22;
  }

  .card1:hover .instagram {
    fill: #ffffff;
    transform: scale(1.1);
  }

  .card2:hover {
    transform: scale(1.06);
    background: #25d366;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
    z-index: 22;
  }

  .card2:hover .whatsapp {
    fill: #ffffff;
    transform: scale(1.1);
  }

  .card3:hover {
    transform: scale(1.06);
    background: #0284c7;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 20px rgba(2, 132, 199, 0.45);
    z-index: 22;
  }

  .card3:hover .share-icon-btn {
    color: #ffffff;
    transform: scale(1.1);
  }

  .card4:hover {
    transform: scale(1.06);
    background: #f59e0b;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
    z-index: 22;
  }

  .card4:hover .pin-icon-btn {
    color: #ffffff;
    transform: scale(1.1);
  }

  .card4.is-pinned {
    background: linear-gradient(150deg, #fffbeb 0%, #fef3c7 100%);
    border-color: rgba(245, 158, 11, 0.45);
  }

  .card4.is-pinned:hover {
    background: #ef4444;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
  }

  .card4.is-pinned:hover .pin-icon-btn {
    color: #ffffff;
  }

  /* Tactile Push-Pin Driving Impact Animation */
  .card4.pinning-impact {
    animation: cardPulse 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .card4.pinning-impact .pin-icon-btn {
    animation: pinDrive 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes cardPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
    }
    40% {
      transform: scale(1.12);
      background: #f59e0b;
      box-shadow: 0 0 28px rgba(245, 158, 11, 0.7);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes pinDrive {
    0% {
      transform: scale(1) translateY(0) rotate(0deg);
    }
    28% {
      transform: scale(1.25) translateY(-9px) rotate(-22deg);
    }
    58% {
      transform: scale(0.85) translateY(5px) rotate(4deg);
    }
    78% {
      transform: scale(1.08) translateY(-2px) rotate(-3deg);
    }
    100% {
      transform: scale(1) translateY(0) rotate(0deg);
    }
  }

  /* Golden Shockwave Ripple */
  .pin-shockwave {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 2px solid #fbbf24;
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.8), inset 0 0 10px rgba(245, 158, 11, 0.5);
    pointer-events: none;
    animation: pinShockwave 0.75s ease-out forwards;
    z-index: 10;
  }

  @keyframes pinShockwave {
    0% {
      transform: translate(-50%, -50%) scale(0.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2.8);
      opacity: 0;
    }
  }

  /* Golden Sparks / Particles */
  .spark {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    border-radius: 9999px;
    background: #fef08a;
    box-shadow: 0 0 8px #f59e0b;
    pointer-events: none;
    z-index: 12;
  }

  .spark-1 { animation: sparkFly1 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .spark-2 { animation: sparkFly2 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .spark-3 { animation: sparkFly3 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .spark-4 { animation: sparkFly4 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .spark-5 { animation: sparkFly5 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  @keyframes sparkFly1 {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% - 24px), calc(-50% - 24px)) scale(0); opacity: 0; }
  }
  @keyframes sparkFly2 {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% + 24px), calc(-50% - 22px)) scale(0); opacity: 0; }
  }
  @keyframes sparkFly3 {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% - 26px), calc(-50% + 14px)) scale(0); opacity: 0; }
  }
  @keyframes sparkFly4 {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% + 26px), calc(-50% + 16px)) scale(0); opacity: 0; }
  }
  @keyframes sparkFly5 {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% + 0px), calc(-50% - 28px)) scale(0); opacity: 0; }
  }

  /* Amber Toast Pill for Pinned Chat */
  .copied-pill.pin-toast {
    background: rgba(22, 17, 10, 0.96);
    border: 1.5px solid rgba(245, 158, 11, 0.55);
    color: #fbbf24;
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.7), 0 0 18px rgba(245, 158, 11, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3);
  }
`;

export default ShareProfileButton;
