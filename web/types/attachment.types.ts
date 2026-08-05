export interface UploadingFile {
    id: string;
    file: File;
    type: "IMAGE" | "VIDEO" | "DOCUMENT" | "VOICE";
    previewUrl?: string;
    progress?: number;
    error?: string;
    attachmentId?: string;
    status?: string
}