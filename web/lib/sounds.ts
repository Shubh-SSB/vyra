let sharedCtx: AudioContext | null = null;

function initAudio() {
    if (typeof window === "undefined") return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const resume = () => {
        if (!sharedCtx) {
            sharedCtx = new AudioContextClass();
        }
        if (sharedCtx.state === "suspended") {
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

// Eagerly initialize on client load
if (typeof window !== "undefined") {
    initAudio();
}

/**
 * Web Audio API synthesizer for premium chat sound effects (sent and received)
 */
export function playSound(type: "sent" | "received") {
    if (typeof window === "undefined") return;
    const enabled = localStorage.getItem("chatSounds") !== "false";
    if (!enabled) return;

    try {
        if (!sharedCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                sharedCtx = new AudioContextClass();
            }
        }

        const ctx = sharedCtx;
        if (!ctx) return;

        // Try to resume the context if it's currently suspended
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => { });
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
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.start(now);
            osc.stop(now + 0.08);
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

            gain1.gain.setValueAtTime(0.18, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc1.start(now);
            osc1.stop(now + 0.08);

            // Chirp 2 (slightly higher, delayed)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(720, now + 0.06);
            osc2.frequency.exponentialRampToValueAtTime(800, now + 0.12);

            gain2.gain.setValueAtTime(0.18, now + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc2.start(now + 0.06);
            osc2.stop(now + 0.14);
        }
    } catch (e) {
        console.error("Audio synthesis failed:", e);
    }
}
