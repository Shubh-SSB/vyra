import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = useCallback(async () => {
        setError(null);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Microphone access is not supported in this browser. Please ensure you are using a secure connection (HTTPS) or localhost.");
            }
            const streamInstance = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(streamInstance);
            chunksRef.current = [];

            let options = {};
            if (typeof MediaRecorder !== "undefined") {
                if (MediaRecorder.isTypeSupported("audio/webm")) {
                    options = { mimeType: "audio/webm" };
                } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
                    options = { mimeType: "audio/mp4" };
                }
            }

            const mediaRecorder = new MediaRecorder(streamInstance, options);
            recorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start(200);
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } catch (err: any) {
            console.error("Failed to start recording", err);
            let userMessage = "Could not access microphone.";
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                userMessage = "Microphone permission was denied. Please allow microphone access in your browser settings.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                userMessage = "No microphone found. Please connect a microphone and try again.";
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                userMessage = "Microphone is already in use by another application.";
            } else if (err.message) {
                userMessage = err.message;
            }
            setError(userMessage);
            setStream(null);
            throw new Error(userMessage);
        }
    }, []);

    const stopRecording = useCallback((): Promise<{ blob: Blob; duration: number }> => {
        return new Promise((resolve) => {
            if (!recorderRef.current) return;
            const mimeType = recorderRef.current.mimeType;
            recorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: mimeType });

                recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
                setStream(null);
                resolve({ blob: audioBlob, duration });
            };
            recorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        });
    }, [duration]);


    const cancelRecording = useCallback(() => {
        if (recorderRef.current) {
            recorderRef.current.stop();
            recorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        setStream(null);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setDuration(0);
        chunksRef.current = [];
    }, []);

    return { isRecording, duration, error, stream, startRecording, stopRecording, cancelRecording };
}