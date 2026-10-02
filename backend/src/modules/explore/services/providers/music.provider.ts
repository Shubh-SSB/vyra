import * as CryptoJS from "crypto-js";
import { RichObject } from "../../types/explore.types";

const SAAVN_KEY = CryptoJS.enc.Utf8.parse("38346591");

function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function decryptSaavnUrl(encryptedUrl: string): string | null {
    try {
        if (!encryptedUrl) return null;
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
        });
        const decrypted = CryptoJS.DES.decrypt(
            cipherParams,
            SAAVN_KEY,
            { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
        );
        const url = decrypted.toString(CryptoJS.enc.Utf8);
        if (!url) return null;
        return url.replace(/_96\.mp4$/, "_320.mp4").replace(/_160\.mp4$/, "_320.mp4");
    } catch {
        return null;
    }
}

export class MusicProvider {
    async search(query: string): Promise<RichObject[]> {
        const searchTerm = query.trim() || "trending hits";

        // 1. Try JioSaavn for full songs first
        try {
            const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&ctx=web6dot0&api_version=4&q=${encodeURIComponent(searchTerm)}&n=12&p=1`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    const tracks: RichObject[] = [];
                    for (const track of data.results) {
                        const encryptedMediaUrl = track.more_info?.encrypted_media_url;
                        const fullStreamUrl = decryptSaavnUrl(encryptedMediaUrl);
                        if (!fullStreamUrl) continue;

                        const imageUrl = (track.image || "")
                            .replace("150x150", "500x500")
                            .replace("50x50", "500x500");
                        const title = decodeHtmlEntities(track.title || "Unknown Track");
                        const subtitle = decodeHtmlEntities(
                            track.more_info?.artistMap?.primary_artists?.[0]?.name ||
                            track.subtitle ||
                            track.more_info?.music ||
                            "Unknown Artist"
                        );
                        const durationSeconds = parseInt(track.more_info?.duration || "0", 10) || null;

                        tracks.push({
                            id: `saavn-${track.id}`,
                            type: "MUSIC" as const,
                            title,
                            subtitle,
                            image: imageUrl,
                            metadata: {
                                preview: fullStreamUrl,
                                streamUrl: fullStreamUrl,
                                isFullSong: true,
                                duration: durationSeconds,
                                album: decodeHtmlEntities(track.more_info?.album || ""),
                                year: track.year || "",
                            },
                            actions: { share: true },
                        });
                    }

                    if (tracks.length > 0) {
                        return tracks;
                    }
                }
            }
        } catch (err) {
            console.warn("[Explore] JioSaavn search failed, falling back to iTunes:", err);
        }

        // 2. Fallback to iTunes if JioSaavn returns nothing
        try {
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=10`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Vyra-App" }
            });

            if (!response.ok) return [];
            const data = await response.json();
            if (!data.results || !Array.isArray(data.results)) return [];

            return data.results.map((track: any) => {
                const durationSeconds = track.trackTimeMillis 
                    ? Math.round(track.trackTimeMillis / 1000) 
                    : null;
                const imageUrl = track.artworkUrl100
                    ? track.artworkUrl100.replace("100x100bb", "500x500bb")
                    : "";

                return {
                    id: `itunes-${track.trackId}`,
                    type: "MUSIC" as const,
                    title: track.trackName || "Unknown Song",
                    subtitle: track.artistName || "Unknown Artist",
                    image: imageUrl,
                    metadata: {
                        preview: track.previewUrl || "",
                        streamUrl: track.previewUrl || "",
                        isFullSong: false,
                        duration: durationSeconds,
                        album: track.collectionName || "",
                        genre: track.primaryGenreName || "",
                        release_date: track.releaseDate || "",
                    },
                    actions: { share: true },
                };
            });
        } catch (err) {
            console.error("[Explore] iTunes search fallback failed:", err);
            return [];
        }
    }

    async getFullStream(title: string, artist: string): Promise<string | null> {
        // 1. Try JioSaavn first for full song stream
        try {
            const searchTerm = `${title} ${artist}`.trim();
            const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&ctx=web6dot0&api_version=4&q=${encodeURIComponent(searchTerm)}&n=3&p=1`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    for (const track of data.results) {
                        const fullUrl = decryptSaavnUrl(track.more_info?.encrypted_media_url);
                        if (fullUrl) return fullUrl;
                    }
                }
            }
        } catch (err) {
            console.warn("[Explore] getFullStream JioSaavn failed:", err);
        }

        // 2. Fallback to iTunes preview
        try {
            const searchTerm = `${title} ${artist}`;
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=1`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Vyra-App" }
            });

            if (!response.ok) return null;
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].previewUrl || null;
            }
            return null;
        } catch (err) {
            console.error("[Explore] iTunes getFullStream failed:", err);
            return null;
        }
    }
}
