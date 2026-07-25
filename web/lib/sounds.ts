let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedCtx) {
        sharedCtx = new AudioContextClass();

        // Setup listener to resume context on user gesture to bypass browser autoplay policies
        const resume = () => {
            if (sharedCtx && sharedCtx.state === "suspended") {
                sharedCtx.resume().catch((err) => {
                    console.warn("Failed to resume AudioContext on user interaction:", err);
                });
            }
            // Remove listeners once resumed
            window.removeEventListener("click", resume);
            window.removeEventListener("keydown", resume);
            window.removeEventListener("touchstart", resume);
        };

        window.addEventListener("click", resume);
        window.addEventListener("keydown", resume);
        window.addEventListener("touchstart", resume);
    }
    return sharedCtx;
}

/**
 * Web Audio API synthesizer for premium chat sound effects (sent and received)
 */
export function playSound(type: "sent" | "received") {
    if (typeof window === "undefined") return;
    const enabled = localStorage.getItem("chatSounds") !== "false";
    if (!enabled) return;

    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Try to resume the context if it's currently suspended (e.g. browser autoplay restrictions)
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        if (type === "sent") {
            // WhatsApp-like clean, high-frequency ascending pop/tap
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = "sine";
            // Frequency sweep up
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(1050, now + 0.04);

            // Volume envelope
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.start(now);
            osc.stop(now + 0.05);
        } else {
            // WhatsApp-like warm dual chirp (descending/ascending bubble)
            // Chirp 1
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(540, now);
            osc1.frequency.exponentialRampToValueAtTime(620, now + 0.05);

            gain1.gain.setValueAtTime(0.05, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc1.start(now);
            osc1.stop(now + 0.05);

            // Chirp 2 (slightly higher, delayed)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(720, now + 0.06);
            osc2.frequency.exponentialRampToValueAtTime(800, now + 0.12);

            gain2.gain.setValueAtTime(0.05, now + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc2.start(now + 0.06);
            osc2.stop(now + 0.12);
        }
    } catch (e) {
        console.error("Audio synthesis failed:", e);
    }
}
