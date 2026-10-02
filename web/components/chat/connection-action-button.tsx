"use client";

import React from "react";
import styled from "styled-components";
import { Clock, UserCheck, UserPlus, Loader2 } from "lucide-react";

export type ConnectionStatus = "NONE" | "FRIENDS" | "PENDING_SENT" | "PENDING_RECEIVED" | null;

interface ConnectionActionButtonProps {
    status: ConnectionStatus;
    isMutating?: boolean;
    onCancel?: () => void;
    onAccept?: () => void;
    onSend?: () => void;
    className?: string;
}

export default function ConnectionActionButton({
    status,
    isMutating,
    onCancel,
    onAccept,
    onSend,
    className,
}: ConnectionActionButtonProps) {
    if (isMutating) {
        return (
            <StyledWrapper className={className}>
                <button
                    disabled
                    type="button"
                    className="liquid-btn loading"
                    title="Updating connection..."
                >
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </button>
            </StyledWrapper>
        );
    }

    if (status === "FRIENDS") {
        return (
            <StyledWrapper className={className}>
                <button
                    type="button"
                    disabled
                    className="liquid-btn emerald"
                    title="Connected"
                >
                    <UserCheck size={20} className="btn-icon" />
                </button>
            </StyledWrapper>
        );
    }

    if (status === "PENDING_SENT") {
        return (
            <StyledWrapper className={className}>
                <button
                    type="button"
                    onClick={onCancel}
                    className="liquid-btn amber"
                    title="Cancel Connection Request"
                >
                    <Clock size={20} className="btn-icon" />
                </button>
            </StyledWrapper>
        );
    }

    if (status === "PENDING_RECEIVED") {
        return (
            <StyledWrapper className={className}>
                <button
                    type="button"
                    onClick={onAccept}
                    className="liquid-btn indigo"
                    title="Accept Connection Request"
                >
                    <UserPlus size={20} className="btn-icon" />
                </button>
            </StyledWrapper>
        );
    }

    return (
        <StyledWrapper className={className}>
            <button
                type="button"
                onClick={onSend}
                className="liquid-btn neutral"
                title="Add Connection"
            >
                <UserPlus size={20} className="btn-icon" />
            </button>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .liquid-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    width: 46px;
    border-radius: 9999px;
    outline: none;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    overflow: hidden;
    will-change: transform, box-shadow, background;

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
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    .btn-icon {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
    }

    &:hover .btn-icon {
      transform: scale(1.08);
    }
  }

  /* Amber State (Pending Connection Request) */
  .liquid-btn.amber {
    background: radial-gradient(circle at 35% 35%, rgba(245, 158, 11, 0.28) 0%, #171108 100%);
    border: 1.5px solid rgba(245, 158, 11, 0.45);
    color: #fbbf24;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.25), 0 0 14px rgba(245, 158, 11, 0.2);

    .btn-icon {
      filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
    }

    &:hover {
      background: radial-gradient(circle at 35% 35%, rgba(245, 158, 11, 0.42) 0%, #20160a 100%);
      border-color: rgba(245, 158, 11, 0.7);
      color: #fef08a;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.35), 0 0 22px rgba(245, 158, 11, 0.35);
    }
  }

  /* Emerald State (Friends / Connected) */
  .liquid-btn.emerald {
    background: radial-gradient(circle at 35% 35%, rgba(16, 185, 129, 0.25) 0%, #09140e 100%);
    border: 1.5px solid rgba(16, 185, 129, 0.45);
    color: #34d399;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.25), 0 0 14px rgba(16, 185, 129, 0.2);
    cursor: default;

    .btn-icon {
      filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
    }

    &:hover {
      background: radial-gradient(circle at 35% 35%, rgba(16, 185, 129, 0.38) 0%, #0d1e15 100%);
      border-color: rgba(16, 185, 129, 0.7);
      color: #a7f3d0;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.35), 0 0 22px rgba(16, 185, 129, 0.35);
    }
  }

  /* Indigo State (Incoming Request / Accept) */
  .liquid-btn.indigo {
    background: radial-gradient(circle at 35% 35%, rgba(99, 102, 241, 0.28) 0%, #0c0d18 100%);
    border: 1.5px solid rgba(99, 102, 241, 0.45);
    color: #818cf8;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.25), 0 0 14px rgba(99, 102, 241, 0.2);

    .btn-icon {
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
    }

    &:hover {
      background: radial-gradient(circle at 35% 35%, rgba(99, 102, 241, 0.42) 0%, #101222 100%);
      border-color: rgba(99, 102, 241, 0.7);
      color: #c7d2fe;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.35), 0 0 22px rgba(99, 102, 241, 0.35);
    }
  }

  /* Neutral State (Add Friend / Default) */
  .liquid-btn.neutral {
    background: radial-gradient(circle at 35% 35%, #222228 0%, #101013 100%);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    color: #e5e5e7;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15);

    &:hover {
      background: radial-gradient(circle at 35% 35%, #2a2a32 0%, #141418 100%);
      border-color: rgba(255, 255, 255, 0.35);
      color: #ffffff;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 1.5px rgba(255, 255, 255, 0.25);
    }
  }

  /* Loading State */
  .liquid-btn.loading {
    background: radial-gradient(circle at 35% 35%, #1d1d24 0%, #0d0d10 100%);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    color: #88888e;
    cursor: not-allowed;
    opacity: 0.65;

    &:hover {
      transform: none;
    }
  }
`;
