import { RichObject } from "../../types/explore.types";

export class HuggingFaceProvider {
    async search(query: string): Promise<RichObject[]> {
        if (!query) return [];
        try {
            const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=10&full=true`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Vyra-App" }
            });

            if (!response.ok) {
                console.error("[Explore] HuggingFace fetch error:", response.statusText);
                return [];
            }

            const data = await response.json();
            if (!Array.isArray(data)) return [];

            return data.map((item: any) => {
                const author = item.author || item.id.split("/")[0] || "Hugging Face";
                const shortId = item.id.includes("/") ? item.id.split("/")[1] : item.id;
                const likes = item.likes || 0;
                const downloads = item.downloads || 0;

                return {
                    id: `hf-${item.id.replace(/\//g, "-")}`,
                    type: "AI_MODEL" as const,
                    title: shortId,
                    subtitle: author,
                    image: "https://huggingface.co/front/assets/huggingface_logo.svg",
                    metadata: {
                        modelId: item.id,
                        author,
                        downloads,
                        likes,
                        pipeline_tag: item.pipeline_tag || "Unknown Pipeline",
                        tags: item.tags?.slice(0, 5) || [],
                        url: `https://huggingface.co/${item.id}`,
                    },
                    actions: {
                        open: `https://huggingface.co/${item.id}`,
                        share: true,
                    },
                };
            });
        } catch (err) {
            console.error("[Explore] Hugging Face search failed:", err);
            return [];
        }
    }
}
